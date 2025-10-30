import { number } from "yup";
import SmartScene from "../../api_old/SmartScene";
import Timeslot from "../Timeslot";
import WeekTimeslot from "../WeekTimeslot";
import Time, { EventCallbacks as EventCallbacksParent } from "./Time";

export interface EventCallbacks extends EventCallbacksParent
{
	week_timeslot_time_minute: (minute: number) => void
}

export default class TimeMinute extends Time
{
	constructor(parent: SmartScene, weekTimeslot: WeekTimeslot, timeslot?: Timeslot)
	{
		super(parent, weekTimeslot, timeslot);
		this._data.minute ??= 0;
	}

	_setData(data: any)
	{
		super._setData(data);
		if (data?.minute !== undefined && data?.minute !== this._data.minute)
			this._parent.emit("week_timeslot_time_minute", this._data.minute = data.minute);
	}

	_getData()
	{
		return ({
			...super._getData(),
			minute: this._update?.minute ?? this._data?.minute
		})
	}

	getInSecond()
	{return (super.getInSecond() + (this._data.minute * 60))}

	get()
	{return (this._getData())}

	set(data: {hour: number, minute: number})
	{
		super.set(data);
		this._data.minute = data.minute ?? this._data.minute;
		return (this);
	}

	getMinute()
	{return (this._update.minute ?? this._data.minute)}

	setMinute(minute: number)
	{
		minute = number().min(0).max(59).required().validateSync(minute);
		if (this._parent.isExists())
		{
			this._update.minute = minute;
			this._updated = true;
		}
		else
			this._data.minute = minute;
		return (this);
	}
}