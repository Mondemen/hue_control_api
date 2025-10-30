import Resource, {EventCallbacks as EventCallbacksParent} from "./Resource";
import Group from "../api/group";
import WeekTimeslot from "../lib/WeekTimeslot";
import util from "util";
import ExtError from "../lib/error";
import Timeslot, {EventCallbacks as EventCallbacksTimeslot} from "../lib/Timeslot";
import {EventCallbacks as EventCallbacksTimesecond} from "../lib/time/TimeSecond";
import {EventCallbacks as EventCallbacksWeekTimeslot} from "../lib/WeekTimeslot";
import Bridge from "./Bridge";
import { string } from "yup";

export interface EventCallbacks extends EventCallbacksParent, EventCallbacksTimeslot, EventCallbacksTimesecond, EventCallbacksWeekTimeslot
{
	name: (name: string) => void;
	current_timeslot_id: (id: string) => void;
	current_timeslot: (timeslot?: Timeslot) => void;
	current_weekday: (weekday: typeof WeekTimeslot.Weekday[keyof typeof WeekTimeslot.Weekday]) => void;
	current_week_timeslot: (weekTimeslot?: WeekTimeslot) => void;
	state: (state: typeof SmartScene.State[keyof typeof SmartScene.State]) => void;
}

export default class SmartScene extends Resource
{
	/**
	 * Image of scene
	 */
	static Image =
	{
		NATURALLIGHT: "eb014820-a902-4652-8ca7-6e29c03b87a1"
	} as const;

	/**
	 * State of smart scene
	 */
	static State =
	{
		ACTIVE: "active",
		INACTIVE: "inactive"
	} as const;

	/**
	 * Action of smart scene
	 */
	static Action =
	{
		ACTIVATE: "activate",
		DEACTIVATE: "deactivate"
	} as const;

	protected _type = Resource.Type.SMART_SCENE;
	_group: Group;
	_weekTimeslots: WeekTimeslot[] = [];

	constructor(bridge?: Bridge, data?: any)
	{
		super(bridge, data);
	}

	[Symbol.for('nodejs.util.inspect.custom')]()
	{
		return (
		{
			...super[Symbol.for('nodejs.util.inspect.custom')](),
			group: this._group,
			weekTimeslots: this._weekTimeslots
		})
	}

	_setData(data: any)
	{
		let weekTimeslot: WeekTimeslot;

		super._setData(data);
		if (data?.metadata?.name !== undefined && this._data.name !== data?.metadata?.name)
			this.emit("name", this._data.name = data?.metadata?.name);
		this._data.image = data?.metadata?.image?.rid ?? this._data.image;
		this._weekTimeslots.forEach(weekTimeslot => weekTimeslot.alive = false);
		data?.week_timeslots?.forEach((weekTimeslotData, index) =>
		{
			if (!this._weekTimeslots[index])
				weekTimeslot = new WeekTimeslot(this, index);
			else
			{
				weekTimeslot = this._weekTimeslots[index];
				weekTimeslot._index = index;
			}
			weekTimeslot._setData(weekTimeslotData);
			this._weekTimeslots.push(weekTimeslot);
		})
		this._weekTimeslots = this._weekTimeslots.filter(weekTimeslot => (!weekTimeslot.alive) ? weekTimeslot._delete() : true);
		if (data?.active_timeslot?.timeslot_id !== undefined && data.active_timeslot.timeslot_id !== this._data.currentTimeslot)
		{
			this.emit("current_timeslot_id", this._data.currentTimeslot = data.active_timeslot.timeslot_id);
			this.emit("current_timeslot", this.getCurrentTimeslot());
		}
		if (data?.active_timeslot?.weekday && data.active_timeslot.weekday !== this._data.currentWeekday)
		{
			this.emit("current_weekday", this._data.currentWeekday = data.active_timeslot.weekday);
			this.emit("current_week_timeslot", this.getCurrentWeekTimeslot());
		}
		if (data?.state && data?.state !== this._data.state)
			this.emit("state", this._data.state = data?.state);
		if (data?.recall?.action)
		{
			if (data.recall.action === SmartScene.Action.ACTIVATE)
				this.emit("state", this._data.state = SmartScene.State.ACTIVE);
			else if (data.recall.action === SmartScene.Action.DEACTIVATE)
				this.emit("state", this._data.state = SmartScene.State.INACTIVE);
		}
	}

	_add()
	{
		super._add();
		this._bridge?.emit("add_scene", this);
		// this._group?.emit("add_scene", this);
	}

	_delete()
	{
		super._delete();
		this._bridge?.emit("delete_scene", this);
		// this._group?.emit("delete_scene", this);
		// this._group?._deleteScene(this);
	}

	/**
	 * Sets the group
	 */
	_setGroup(group: Group)
	{
		// eslint-disable-next-line no-unsafe-optional-chaining
		if (group instanceof (this._bridge as Bridge)?.Object.Group)
			this._group = group;
	}

	emit<T extends keyof EventCallbacks>(eventName: T, ...args: Parameters<EventCallbacks[T]>)
	{
		// if (eventName.includes("event_start"))
		// 	this._group?._eventStart();
		this._group?.emit<any>(`scene_${eventName}`, this, ...args);
		super.emit<any>(eventName, ...args);
	}
	on<T extends keyof EventCallbacks>(eventName: T, listener: EventCallbacks[T]) {return (super.on<any>(eventName, listener))}
	once<T extends keyof EventCallbacks>(eventName: T, listener: EventCallbacks[T]) {return (super.once<any>(eventName, listener))}
	removeAllListeners<T extends keyof EventCallbacks>(eventName: T) {return (super.removeAllListeners<any>(eventName))}

	/**
	 * Get smart scene name
	 */
	getName(): string
	{
		if (this.isExists())
			return (this._update.metadata?.name ?? this._data.name)
		return (this._create.metadata?.name);
	}

	/**
	 * Set smart scene name
	 */
	setName(name: string)
	{
		let data = (this.isExists()) ? this._update : this._create;

		data.metadata ??= {};
		data.metadata.name = name;
		return (this);
	}

	/**
	 * Get smart scene image
	 */
	getImage()
	{return (this._data.image)}

	/**
	 * Set smart scene image
	 */
	setImage(image: typeof SmartScene.Image[keyof typeof SmartScene.Image] | string)
	{
		image = string().uuid().required().validateSync(image);
		if (this.isExists())
			throw new ExtError(1, "Image can be define only during the creation of the scene");
		this._create.metadata ??= {};
		this._create.metadata.image ??= {};
		this._create.metadata.image.rid = image;
		this._create.metadata.image.rtype = Resource.Type.PUBLIC_IMAGE;
		return (this);
	}

	isNative()
	{return (Object.values(SmartScene.Image).includes(this.getImage()))}

	getGroup()
	{return (this._group)}

	getWeekTimeslots()
	{return (this._weekTimeslots)}

	getWeekTimeslotFromWeekday(weekday: typeof WeekTimeslot.Weekday[keyof typeof WeekTimeslot.Weekday])
	{return (this._weekTimeslots.find(weekTimeslot => weekTimeslot.getWeekdays().has(weekday)))}

	addWeekTimeslot()
	{
		let weekTimeslot = new WeekTimeslot(this, this._weekTimeslots.length);

		this._weekTimeslots.push(weekTimeslot);
		return (weekTimeslot);
	}

	deleteWeekTimeslot(index: number)
	{
		this._weekTimeslots.splice(index, 1);
		this._weekTimeslots.forEach((weekTimeslot, i) => weekTimeslot._index = i);
	}

	clearWeekTimeslot()
	{this._weekTimeslots = []}

	getCurrentWeekTimeslot()
	{return (this._weekTimeslots.find(weekTimeslot => weekTimeslot.getWeekdays().has(this._data.currentWeekday)))}

	getCurrentTimeslot(): Timeslot | undefined
	{return (this.getCurrentWeekTimeslot()?.getTimeslots()?.[this._data.currentTimeslot])}

	getTimeslotFromDate(weekday: typeof WeekTimeslot.Weekday[keyof typeof WeekTimeslot.Weekday], date: {hour: number, minute: number, second: number})
	{return (this.getWeekTimeslotFromWeekday(weekday)?.getTimeslotFromDate(date))}

	/**
	 * Get current state of smart scene
	 */
	getState(): typeof SmartScene.State[keyof typeof SmartScene.State]
	{
		if (this._update.recall?.action)
		{
			if (this._update.recall.action === SmartScene.Action.ACTIVATE)
				return (SmartScene.State.ACTIVE);
			return (SmartScene.State.INACTIVE);
		}
		return (this._data.state);
	}

	/**
	 * Set state of light
	 */
	setState(state: typeof SmartScene.State[keyof typeof SmartScene.State])
	{
		state = string().oneOf(Object.values(SmartScene.State)).required().validateSync(state);
		if (state === SmartScene.State.ACTIVE)
			this._update.recall = {action: SmartScene.Action.ACTIVATE};
		else if (state === SmartScene.State.INACTIVE)
			this._update.recall = {action: SmartScene.Action.DEACTIVATE};
		return (this);
	}

	async create()
	{
		this._create =
		{
			type: this._type,
			group:
			{
				rid: this._group.getID(),
				rtype: this._group.getType()
			},
			...this._create,
			week_timeslots: this._weekTimeslots.map(weekTimeslot => weekTimeslot._getData())
		};
		console.log("CREATE", util.inspect(this._create, false, null, true));
		// return;
		await super.create();
		this._exists = true;
		// this._group._addScene(this);
	}

	async delete()
	{
		await super.delete();
		// this._group?._deleteScene(this);
	}

	async update()
	{
		if (this._weekTimeslots.find(timeslot => timeslot._updated))
			this._update.week_timeslots = this._weekTimeslots.map(weekTimeslot => weekTimeslot._getData());
		await super.update();
	}

	async activate()
	{
		let isExists = this.isExists();
		let error: any;

		this.prepareUpdate();
		this.setState(SmartScene.State.ACTIVE);
		if (!isExists)
			await this.create();
		else
		{
			try
			{await this.update()}
			catch (err)
			{error = err}
			finally
			{this._update = {}}
		}
		if (!isExists)
			await this.delete();
		if (error)
			throw error;
	}

	async deactivate()
	{
		let isExists = this.isExists();
		let error: any;

		this.prepareUpdate();
		this.setState(SmartScene.State.INACTIVE);
		if (!isExists)
			await this.create();
		else
		{
			try
			{await this.update()}
			catch (err)
			{error = err}
			finally
			{this._update = {}}
		}
		if (!isExists)
			await this.delete();
		if (error)
			throw error;
	}
}
