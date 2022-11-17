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

	getTemperature()
	{return (this._data.temperature)}
}