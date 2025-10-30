import { number } from "yup";
import SmartScene from "../../api_old/SmartScene";
import Timeslot from "../Timeslot";
import WeekTimeslot from "../WeekTimeslot";
import TimeMinute, { EventCallbacks as EventCallbacksParent } from "./TimeMinute";

export interface EventCallbacks extends EventCallbacksParent
{
	week_timeslot_time_second: (second: number) => void
}

export default class TimeSecond extends TimeMinute
{
	constructor(parent: SmartScene, weekTimeslot: WeekTimeslot, timeslot?: Timeslot)
	{
		super(parent, weekTimeslot, timeslot);
		this._data.second ??= 0;
	}

	_setData(data: any)
	{
		super._setData(data);
		if (data?.second !== undefined && data?.second !== this._data.second)
			this._parent.emit("week_timeslot_time_second", this._data.second = data.second);
	}

	_getData()
	{
		return ({
			...super._getData(),
			second: this._update?.second ?? this._data?.second
		})
	}

	getInSecond(): number
	{return (super.getInSecond() + this._data.second)}

	get()
	{return (this._getData())}

	set(data: {hour: number, minute: number, second: number})
	{
		super.set(data);
		this._data.second = data.second ?? this._data.second;
		return (this);
	}

	getSecond()
	{return (this._update.second ?? this._data.second)}

	setSecond(second: number)
	{
		second = number().min(0).max(59).required().validateSync(second);
		if (this._parent.isExists())
		{
			this._update.second = second;
			this._updated = true;
		}
		else
			this._data.second = second;
		return (this);
	}
}