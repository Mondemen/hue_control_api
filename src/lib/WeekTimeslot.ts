import SmartScene from "../api_old/SmartScene";
import ExtError from "./error";
import TimeSecond from "./time/TimeSecond";
import Timeslot from "./Timeslot";

export interface EventCallbacks
{
	week_add: (weekTimeslot: WeekTimeslot) => void;
	week_delete: (weekTimeslot: WeekTimeslot) => void;
	week_weekdays: (weekTimeslot: WeekTimeslot, weekdays: Set<typeof WeekTimeslot.Weekday[keyof typeof WeekTimeslot.Weekday]>) => void;
}

export default class WeekTimeslot
{
	/**
	 * List of week day
	 */
	static Weekday =
	{
		MONDAY: "monday",
		TUESDAY: "tuesday",
		WEDNESDAY: "wednesday",
		THURSDAY: "thursday",
		FRIDAY: "friday",
		SATURDAY: "saturday",
		SUNDAY: "sunday"
	} as const;

	alive = true;
	_init = false;
	_smartScene: SmartScene;
	_index: number;
	_timeslots: Timeslot[] = [];
	_recurrence = new Set<typeof WeekTimeslot.Weekday[keyof typeof WeekTimeslot.Weekday]>();
	_updated = false;

	constructor(smartScene: SmartScene, index: number)
	{
		this._smartScene = smartScene;
		this._index = index;
	}

	[Symbol.for('nodejs.util.inspect.custom')]()
	{
		return ({
			index: this._index,
			timeslots: this._timeslots,
			recurrence: this._recurrence
		})
	}

	_setData(data: any)
	{
		let timeslot: Timeslot;

		this.alive = true;
		this._timeslots.forEach(timeslot => timeslot.alive = false);
		data?.timeslots?.forEach((timeslotData: any, index: number) =>
		{
			if (!this._timeslots[index])
				timeslot = new Timeslot(this._smartScene, this, index);
			else
			{
				timeslot = this._timeslots[index];
				timeslot._index = index;
			}
			timeslot._setData(timeslotData);
			this._timeslots.push(timeslot);
		})
		this._timeslots = this._timeslots.filter(timeslot => (!timeslot.alive) ? timeslot._delete() : true);
		if (data?.recurrence && data.recurrence?.length !== this._recurrence?.size)
		{
			data?.recurrence.forEach(weekday => this._recurrence.add(weekday));
			this._smartScene.emit("week_weekdays", this, this._recurrence);
		}
		if (!this._init)
			this._add();
	}

	_getData()
	{
		return ({
			timeslots: this._timeslots.map(timeslot => timeslot._getData()),
			recurrence: [...this._recurrence]
		})
	}

	_add()
	{
		this._smartScene.emit("week_add", this);
		this._init = true;
	}

	_delete()
	{this._smartScene.emit("week_delete", this)}

	getIndex()
	{return (this._index)}

	getSmartScene()
	{return (this._smartScene)}

	getTimeslots()
	{return (this._timeslots)}

	getTimeslotFromDate(date: any)
	{
		let timeslots: Timeslot[], timeslot: Timeslot | undefined;
		let timeSecond = new TimeSecond(this._smartScene, this).set(date).getInSecond();

		timeslots = this._timeslots.sort((ts1, ts2) => ts1.getTime().getInSecond() - ts2.getTime().getInSecond());
		timeslot = [...timeslots].reverse().find(timeslot => timeslot.getTime().getInSecond() <= timeSecond);
		timeslot ??= timeslots[timeslots.length - 1];
		return (timeslot);
	}

	addTimeslot()
	{
		let timeslot = new Timeslot(this._smartScene, this, this._timeslots.length);

		this._timeslots.push(timeslot);
		return (timeslot);
	}

	/**
	 * Get list of weekday used to recurrence
	 */
	getWeekdays(): Set<typeof WeekTimeslot.Weekday[keyof typeof WeekTimeslot.Weekday]>
	{return (this._recurrence)}

	addWeekday(weekday: typeof WeekTimeslot.Weekday[keyof typeof WeekTimeslot.Weekday])
	{
		if (this._smartScene.getWeekTimeslots().find(weekTimeslot => weekTimeslot !== this && weekTimeslot._recurrence.has(weekday)))
			throw new ExtError(1, `This weekday (${weekday}) is already defined in another week timeslot`);
		this._recurrence.add(weekday);
		if (this._smartScene.isExists())
			this._updated = true;
		return (this);
	}

	deleteWeekday(weekday: typeof WeekTimeslot.Weekday[keyof typeof WeekTimeslot.Weekday])
	{
		this._recurrence.delete(weekday);
		if (this._smartScene.isExists())
			this._updated = true;
		return (this);
	}
}