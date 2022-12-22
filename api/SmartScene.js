import Resource from "./Resource.js";
import {checkParam} from "../utils/index.js";
import ErrorCodes from "../lib/error/ErrorCodes.js";
import WeekTimeslot from "../lib/WeekTimeslot.js";
import util from "util";
import {Timeslot} from "../index.js";

/**
 * @typedef {import('./group/Group.js').default} Group
 * @typedef {import('./Resource.js').EventCallback} EventCallbackInherit
 */

/**
 * @callback NameEvent
 * @param {string} name - Name of device
 *
 * @callback CurrentTimeslotIDEvent
 * @param {number} timeslot_id - Current timeslot ID
 *
 * @callback CurrentTimeslotEvent
 * @param {Timeslot} timeslot - Current timeslot
 *
 * @callback CurrentWeekdayEvent
 * @param {WeekTimeslot.Weekday[keyof typeof WeekTimeslot.Weekday]} weekday - Current weekday
 *
 * @callback CurrentWeekTimeslotEvent
 * @param {WeekTimeslot} weektimeslot - Current week timeslot
 *
 * @callback StateEvent
 * @param {SmartScene.State} state - State
 *
 * @typedef EventCallbackTypes
 * @type {Object}
 * @property {NameEvent} name
 * @property {CurrentTimeslotIDEvent} current_timeslot_id
 * @property {CurrentTimeslotEvent} current_timeslot
 * @property {CurrentWeekdayEvent} current_weekday
 * @property {CurrentWeekTimeslotEvent} current_week_timeslot
 * @property {import("../lib/time/Time.js").HourEvent} week_timeslot_time_hour
 * @property {import("../lib/time/TimeMinute.js").MinuteEvent} week_timeslot_time_minute
 * @property {import("../lib/time/TimeSecond.js").SecondEvent} week_timeslot_time_second
 * @property {import("../lib/Timeslot.js").TimeEvent} week_timeslot_time
 * @property {import("../lib/Timeslot.js").SceneEvent} week_timeslot_scene
 * @property {import("../lib/WeekTimeslot.js").WeekdaysEvent} week_weekdays
 * @property {State} state
 * @typedef {EventCallbackInherit & EventCallbackTypes} EventCallback
 */

export default class SmartScene extends Resource
{
	/**
	 * Image of scene
	 *
	 * @enum {string}
	 * @readonly
	 */
	static Image =
	{
		NATURALLIGHT: "eb014820-a902-4652-8ca7-6e29c03b87a1"
	}

	/**
	 * State of smart scene
	 *
	 * @enum {string}
	 * @readonly
	 */
	static State =
	{
		ACTIVE: "active",
		INACTIVE: "inactive"
	}

	/**
	 * Action of smart scene
	 *
	 * @enum {string}
	 * @readonly
	 */
	static Action =
	{
		ACTIVATE: "activate",
		DEACTIVATE: "deactivate"
	}

	/** @private */
	_type = "smart_scene";
	/**
	 * @type {Group}
	 * @private
	 * */
	_group;
	/**
	 * @type {WeekTimeslot[]}
	 * @private
	 */
	_weekTimeslots = [];

	constructor(bridge, data)
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

	_setData(data)
	{
		let weekTimeslot;

		super._setData(data);
		if (data?.metadata?.name != undefined && this._data.name != data?.metadata?.name)
			this.emit("name", this._data.name = data?.metadata?.name);
		this._data.image = data?.metadata?.image?.rid ?? this._data.image;
		data?.week_timeslots?.forEach((weekTimeslotData, index) =>
		{
			weekTimeslot = this._weekTimeslots[index] ?? new WeekTimeslot(this, index);
			weekTimeslot._setData(weekTimeslotData);
			this._weekTimeslots.push(weekTimeslot);
		})
		if (data?.active_timeslot?.timeslot_id != undefined && data.active_timeslot.timeslot_id != this._data.currentTimeslot)
		{

			this.emit("current_timeslot_id", this._data.currentTimeslot = data.active_timeslot.timeslot_id);
			this.emit("current_timeslot", this.getCurrentTimeslot());
		}
		if (data?.active_timeslot?.weekday && data.active_timeslot.weekday != this._data.currentWeekday)
		{
			this.emit("current_weekday", this._data.currentWeekday = data.active_timeslot.weekday);
			this.emit("current_week_timeslot", this.getCurrentWeekTimeslot());
		}
		if (data?.state && data?.state != this._data.state)
			this.emit("state", this._data.state = data?.state);
		if (data?.recall?.action)
		{
			if (data.recall.action == SmartScene.Action.ACTIVATE)
				this.emit("state", this._data.state = SmartScene.State.ACTIVE);
			else if (data.recall.action == SmartScene.Action.DEACTIVATE)
				this.emit("state", this._data.state = SmartScene.State.INACTIVE);
		}
	}

	_add()
	{
		super._add();
		this._bridge?.emit("add_scene", this);
		this._group?.emit("add_scene", this);
	}

	_delete()
	{
		super._delete();
		this._bridge?.emit("delete_scene", this);
		this._group?.emit("delete_scene", this);
		this._group?._deleteScene(this);
	}

	/**
	 * Sets the group
	 *
	 * @private
	 * @param {Group} group The group
	 */
	_setGroup(group)
	{
		if (group instanceof this._bridge.Object.Group)
			this._group = group;
	}

	emit(eventName, ...args)
	{
		if (eventName.includes("event_start"))
			this._group?._eventStart();
		this._group?.emit?.(`scene_${eventName}`, this, ...args);
		super.emit(eventName, ...args);
	}

	/**
	 * @template {keyof EventCallback} T
	 * @param {T} eventName The event name
	 * @param {EventCallback[T]} listener The listener
	 */
	on(eventName, listener)
	{return (super.on(eventName, listener))}

	/**
	 * @template {keyof EventCallback} T
	 * @param {T} eventName The event name
	 * @param {EventCallback[T]} listener The listener
	 */
	once(eventName, listener)
	{return (super.once(eventName, listener))}

	getName()
	{
		if (this.isExists())
			return (this._update.metadata?.name ?? this._data.name)
		return (this._create.metadata?.name);
	}

	/**
	 * Set scene name
	 *
	 * @param {string} name - The name
	 * @returns {Scene|Promise} Return this object if prepareUpdate() was called, otherwise returns Promise
	 */
	setName(name)
	{
		let data = (this.isExists()) ? this._update : this._create;

		checkParam(this, "setName", "name", name, "string");
		data.metadata ??= {};
		data.metadata.name = name;
		if (this.isExists() && !this._prepareUpdate)
			return (this.update());
		return (this);
	}

	getImage()
	{return (this._data.image)}

	/**
	 * Set scene image
	 *
	 * @param {Scene.Image[keyof typeof Scene.Image]} image - The image
	 * @returns {Scene} Return this object
	 */
	setImage(image)
	{
		checkParam(this, "setImage", "image", image, "string");
		if (!/^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$/.test(image))
			throw {code: ErrorCodes.badUUID, message: "Image ID does not match with accepted pattern (uuid v4)"};
		if (this.isExists())
			throw {code: ErrorCodes.alreadyExists, message: "Image can be define only during the creation of the scene"};
		this._create.metadata ??= {};
		this._create.metadata.image ??= {};
		this._create.metadata.image.rid = image;
		this._create.metadata.image.rtype = Resource.Type.PUBLIC_IMAGE;
		return (this);
	}

	isNative()
	{return (Object.values(Scene.Image).includes(this.getImage()))}

	getGroup()
	{return (this._group)}

	getWeekTimeslots()
	{return (this._weekTimeslots)}

	getWeekTimeslotFromWeekday(weekday)
	{return (this._weekTimeslots.find(weekTimeslot => weekTimeslot.getWeekdays().has(weekday)))}

	addWeekTimeslot()
	{
		let weekTimeslot = new WeekTimeslot(this, this._weekTimeslots.length);

		this._weekTimeslots.push(weekTimeslot);
		return (weekTimeslot);
	}

	deleteWeekTimeslot(index)
	{
		this._weekTimeslots.splice(index, 1);
		this._weekTimeslots.forEach((weekTimeslot, i) => weekTimeslot._index = i);
	}

	clearWeekTimeslot()
	{this._weekTimeslots = []}

	getCurrentWeekTimeslot()
	{return (this._weekTimeslots.find(weekTimeslot => weekTimeslot.getWeekdays().has(this._data.currentWeekday)))}

	getCurrentTimeslot()
	{return (this.getCurrentWeekTimeslot()?.getTimeslots()?.[this._data.currentTimeslot])}

	getState()
	{
		if (this._update.recall?.action)
		{
			if (this._update.recall.action == SmartScene.Action.ACTIVATE)
				return (SmartScene.State.ACTIVE);
			return (SmartScene.State.INACTIVE);
		}
		return (this._data.state);
	}

	/**
	 * Set state of light
	 *
	 * @param {SmartScene.State[keyof typeof SmartScene.State]} state - The state
	 * @returns {SmartScene|Promise} Return this object if prepareUpdate() was called, otherwise returns Promise
	 */
	setState(state)
	{
		checkParam(this, "setState", "state", state, SmartScene.State, "SmartScene.State");
		if (state == SmartScene.State.ACTIVE)
			this._update.recall = {action: SmartScene.Action.ACTIVATE};
		else if (state == SmartScene.State.INACTIVE)
			this._update.recall = {action: SmartScene.Action.DEACTIVATE};
		if (this._prepareUpdate)
			return (this);
		return (this.update());
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
		this._group._addScene(this);
	}

	async delete()
	{
		await super.delete();
		this._group?._deleteScene(this);
	}

	async update()
	{
		if (this._weekTimeslots.find(timeslot => timeslot._updated))
			this._update.week_timeslots = this._weekTimeslots.map(weekTimeslot => weekTimeslot._getData());
		console.log("UPDATE", util.inspect(this._update, false, null, true));
		await super.update();
	}

	async activate()
	{
		let isExists = this.isExists();
		let error;

		if (!isExists)
		{
			this.setState(SmartScene.State.ACTIVE);
			await this.create();
		}
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
		let error;

		if (!isExists)
		{
			this.setState(SmartScene.State.INACTIVE);
			await this.create();
		}
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
