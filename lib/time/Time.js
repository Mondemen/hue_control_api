import Resource from "../../api/Resource.js";
import {checkParam} from "../../utils/index.js";
import ErrorCodes from "../error/ErrorCodes.js";

export default class Time
{
	/** @private */
	_parent;
	/**
	 * @type {Resource}
	 * @private
	 */
	_resource;
	/** @private */
	_data = {};
	/** @private */
	_update = {};
	/** @private */
	_updated = false;

	/**
	 *
	 * @param {Resource} resource
	 * @param {*} parent
	 */
	constructor(resource, parent)
	{
		this._resource = resource;
		this._parent = parent;
		this._data.hour ??= 0;
	}

	[Symbol.for('nodejs.util.inspect.custom')]()
	{return (this._data)}

	/**
	 * @private
	 */
	_setData(data)
	{
		if (data?.hour != undefined && data?.hour != this._data.hour)
			this._parent.emit("hour", this._data.hour = data.hour);
	}

	/**
	 * @private
	 */
	_getData()
	{
		return ({
			hour: this._update?.hour ?? this._data?.hour
		})
	}

	getHour()
	{return (this._update.hour ?? this._data.hour)}

	setHour(hour)
	{
		checkParam(this, "setHour", "hour", hour, "number");
		if (hour < 0 || hour > 23)
			throw {code: ErrorCodes.badHourRange, message: "The hour must be between 0 and 23"};
		if (this._resource.isExists())
		{
			this._update.hour = hour;
			this._updated = true;
			if (!this._resource._prepareUpdate)
				return (this._resource.update());
		}
		else
			this._data.hour = hour;
		return (this);
	}
}