import Scene from "../api/Scene.js";
import SmartScene from "../api/SmartScene.js";
import {checkParam} from "../utils/index.js";
import ErrorCodes from "./error/ErrorCodes.js";
import Timeslot from "./Timeslot.js";

/**
 * @callback WeekdaysEvent
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

		data?.timeslots?.forEach((timeslotData, index) =>
		{
			timeslot = this._timeslots[index] ?? new Timeslot(this._smartScene, this, index);
			timeslot._setData(timeslotData);
			this._timeslots.push(timeslot);
		})
		if (data?.recurrence && data.recurrence?.length != this.recurrence?.size)
		{
			data?.recurrence.forEach(weekday => this._recurrence.add(weekday));
			this.emit("weekdays", this._recurrence);
		}
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
	emit(eventName, ...args)
	{this._smartScene.emit(`week_${eventName}`, this, ...args)}

	getIndex()
	{return (this._index)}

	getTimeslots()
	{return (this._timeslots)}

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
			throw {code: ErrorCodes.alreadyExists, message: `This weekday (${weekday}) is already defined in another week timeslot`};
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