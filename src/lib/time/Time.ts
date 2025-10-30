import { number } from "yup";
import SmartScene from "../../api_old/SmartScene";
import Timeslot from "../Timeslot";
import WeekTimeslot from "../WeekTimeslot";

export interface EventCallbacks
{
	week_timeslot_time_hour: (hour: number) => void
}

export default class Time
{
	protected _parent: SmartScene;
	_weekTimeslot: WeekTimeslot;
	_timeslot?: Timeslot;
	_data: any = {};
	_update: any = {};
	_updated = false;

	constructor(parent: SmartScene, weekTimeslot: WeekTimeslot, timeslot?: Timeslot)
	{
		this._parent = parent;
		this._weekTimeslot = weekTimeslot;
		this._timeslot = timeslot;
		this._data.hour ??= 0;
	}

	[Symbol.for('nodejs.util.inspect.custom')]()
	{return ({...this._data, timeInSecond: this.getInSecond()})}

	_setData(data: any)
	{
		if (data?.hour !== undefined && data?.hour !== this._data.hour)
			this._parent.emit("week_timeslot_time_hour", this._data.hour = data.hour);
	}

	_getData()
	{
		return ({
			hour: this._update?.hour ?? this._data?.hour
		})
	}

	getInSecond()
	{return (this._data.hour * 60 * 60)}

	get()
	{return (this._getData())}

	set(data: {hour: number})
	{
		this._data.hour = data.hour ?? this._data.hour;
		return (this);
	}

	getHour()
	{return (this._update.hour ?? this._data.hour)}

	setHour(hour: number)
	{
		hour = number().min(0).max(23).required().validateSync(hour);
		if (this._parent.isExists())
		{
			this._update.hour = hour;
			this._updated = true;
		}
		else
			this._data.hour = hour;
		return (this);
	}
}