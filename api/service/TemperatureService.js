import { checkParam } from "../../utils/index.js";
import Service from "./Service.js";

export default class TemperatureService extends Service
{
	constructor(bridge, data)
	{
		super(bridge, data);
	}

	_setData(data, update = false)
	{
		super._setData(data, update);
		if (data?.enabled != undefined)
			this.emit("temperature_enabled", this._data.enabled = data.enabled);
		if (data?.temperature?.temperature != undefined)
			this.emit("temperature", this._data.temperature = data.temperature);
	}

	isEnabled()
	{return (this._data.enabled)}

	/**
	 * Enable or not the temperature sensor
	 *
	 * @param {boolean} enabled - true if enabled, otherwise false
	 * @returns {TemperatureService|Promise} - Return this object if prepareUpdate() was called, otherwise returns Promise
	 */
	setEnabled(enabled, sender = this)
	{
		checkParam(this, "setEnabled", "enable", enabled, "boolean");
		this._update.enabled = enabled;
		if (sender._prepareUpdate)
		{
			sender._updatedService[this.getID()] = this;
			return (sender);
		}
		return (this.update());
	}

	getTemperature()
	{return (this._data.temperature)}
}