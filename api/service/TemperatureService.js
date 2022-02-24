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
		{
			this._data.enabled = data.enabled;
			this.emit("temperature_enabled", this._data.enabled);
		}
		if (data?.temperature?.temperature != undefined)
		{
			this._data.temperature = data.temperature;
			this.emit("temperature", this._data.temperature);
		}
	}

	isEnabled()
	{return (this._data.enabled)}

	getTemperature()
	{return (this._data.temperature)}
}