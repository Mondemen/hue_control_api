import {checkParam} from "../../utils/index.js";
import ErrorCodes from "../error/ErrorCodes.js";
import ExtError from "../error/ExtError.js";
import TimeMinute from "./TimeMinute.js";

/**
 * @callback SecondEvent
 * @param {number} second - Current second
 */

export default class TimeSecond extends TimeMinute
{
	constructor(resource, parent)
	{
		super(resource, parent);
		this._data.second ??= 0;
	}

	_setData(data)
	{
		super._setData(data);
		if (data?.second != undefined && data?.second != this._data.second)
			this.emit("second", this._data.second = data.second);
	}

	/**
	 * @private
	 */
	_getData()
	{
		return ({
			...super._getData(),
			second: this._update?.second ?? this._data?.second
		})
	}

	/**
	 * @returns {number}
	 */
	getInSecond()
	{return (super.getInSecond() + this._data.second)}

	get()
	{return (this._getData())}

	/**
	 * @param {object} data
	 * @param {number} data.hour - Hour
	 * @param {number} data.minute - Minute
	 * @param {number} data.second - Second
	 */
	set(data)
	{
		super.set(data);
		this._data.second = data.second ?? this._data.second;
		return (this);
	}

	getSecond()
	{return (this._update.second ?? this._data.second)}

	setSecond(second)
	{
		checkParam(this, "setSecond", "second", second, "number");
		if (second < 0 || second > 59)
			throw new ExtError(ErrorCodes.badSecondRange);
		if (this._resource.isExists())
		{
			this._update.second = second;
			this._updated = true;
			if (!this._resource._prepareUpdate)
				return (this._resource.update());
		}
		else
			this._data.second = second;
		return (this);
	}
}