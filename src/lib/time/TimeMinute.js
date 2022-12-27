import {checkParam} from "../../utils/index.js";
import ErrorCodes from "../error/ErrorCodes.js";
import ExtError from "../error/ExtError.js";
import Time from "./Time.js";

/**
 * @callback MinuteEvent
 * @param {number} minute - Current minute
 */

export default class TimeMinute extends Time
{
	constructor(resource, parent)
	{
		super(resource, parent);
		this._data.minute ??= 0;
	}

	_setData(data)
	{
		super._setData(data);
		if (data?.minute != undefined && data?.minute != this._data.minute)
			this.emit("minute", this._data.minute = data.minute);
	}

	/**
	 * @private
	 */
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

	/**
	 * @param {object} data
	 * @param {number} data.hour - Hour
	 * @param {number} data.minute - Minute
	 */
	set(data)
	{
		super.set(data);
		this._data.minute = data.minute ?? this._data.minute;
		return (this);
	}

	getMinute()
	{return (this._update.minute ?? this._data.minute)}

	setMinute(minute)
	{
		checkParam(this, "setMinute", "minute", minute, "number");
		if (minute < 0 || minute > 59)
			throw new ExtError(ErrorCodes.badMinuteRange);
		if (this._resource.isExists())
		{
			this._update.minute = minute;
			this._updated = true;
			if (!this._resource._prepareUpdate)
				return (this._resource.update());
		}
		else
			this._data.minute = minute;
		return (this);
	}
}