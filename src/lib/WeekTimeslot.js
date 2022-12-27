import SmartScene from "../api/SmartScene.js";
import {TimeSecond} from "../index.js";
import {checkParam} from "../utils/index.js";
import ErrorCodes from "./error/ErrorCodes.js";
import ExtError from "./error/ExtError.js";
import Timeslot from "./Timeslot.js";

/**
 * @callback AddEvent
 * @param {WeekTimeslot} weekTimeslot - Week timeslot
 *
 * @callback DeleteEvent
 * @param {WeekTimeslot} weekTimeslot - Week timeslot
 *
 * @callback WeekdaysEvent
 * @param {WeekTimeslot} weekTimeslot - Week timeslot
 * @param {Set<WeekTimeslot.Weekday[keyof typeof WeekTimeslot.Weekday]>} weekdays - List of weekday
 */

export default class WeekTimeslot
{
	/**
	 * List of week day
	 *
	 * @enum {string}
	 * @readonly
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
	}

	/**
	 * @type {boolean}
	 * @private
	 */
	_alive = true;
	/**
	 * @type {boolean}
	 * @private
	 */
	_init = false;
	/**
	 * @type {SmartScene}
	 * @private
	 */
	_smartScene;
	/**
	 * @type {number}
	 * @private
	 */
	_index;
	/**
	 * @type {Timeslot[]}
	 * @private
	 */
	_timeslots = [];
	/**
	 * @type {Set<WeekTimeslot.Weekday[keyof typeof WeekTimeslot.Weekday]>}
	 * @private
	 */
	_recurrence = new Set();
	/**
	 * @type {boolean}
	 * @private
	 */
	_updated = false;

	constructor(smartScene, index)
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

	/**
	 * @private
	 */
	_setData(data)
	{
		let timeslot;

		this._alive = true;
		this._timeslots.forEach(timeslot => timeslot._alive = false);
		data?.timeslots?.forEach((timeslotData, index) =>
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
		this._timeslots = this._timeslots.filter(timeslot => (!timeslot._alive) ? timeslot._delete() : true);
		if (data?.recurrence && data.recurrence?.length != this.recurrence?.size)
		{
			data?.recurrence.forEach(weekday => this._recurrence.add(weekday));
			this.emit("weekdays", this._recurrence);
		}
		if (!this._init)
			this._add();
	}

	/**
	 * @private
	 */
	_getData()
	{
		return ({
			timeslots: this._timeslots.map(timeslot => timeslot._getData()),
			recurrence: [...this._recurrence]
		})
	}

	/**
	 * @private
	 */
	_add()
	{
		this.emit("add");
		this._init = true;
	}

	/**
	 * @private
	 */
	_delete()
	{this.emit("delete")}

	/**
	 * @private
	 */
	emit(eventName, ...args)
	{this._smartScene.emit(`week_${eventName}`, this, ...args)}

	getIndex()
	{return (this._index)}

	getSmartScene()
	{return (this._smartScene)}

	getTimeslots()
	{return (this._timeslots)}

	getTimeslotFromDate(date)
	{
		let timeslots, timeslot;
		let timeSecond = new TimeSecond().set(date).getInSecond();

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
	 *
	 * @returns {Set<WeekTimeslot.Weekday[keyof typeof WeekTimeslot.Weekday]>}
	 */
	getWeekdays()
	{return (this._recurrence)}

	addWeekday(weekday)
	{
		checkParam(this, "addWeekday", "weekday", weekday, "string");
		if (this._smartScene.getWeekTimeslots().find(weekTimeslot => weekTimeslot !== this && weekTimeslot._recurrence.has(weekday)))
			throw new ExtError(ErrorCodes.alreadyExists, `This weekday (${weekday}) is already defined in another week timeslot`);
		this._recurrence.add(weekday);
		if (this._smartScene.isExists())
		{
			this._updated = true;
			if (!this._smartScene._prepareUpdate)
				return (this._smartScene.update());
		}
		return (this);
	}

	deleteWeekday(weekday)
	{
		checkParam(this, "addWeekday", "weekday", weekday, "string");
		this._recurrence.delete(weekday);
		if (this._smartScene.isExists())
		{
			this._updated = true;
			if (!this._smartScene._prepareUpdate)
				return (this._smartScene.update());
		}
		return (this);
	}
}