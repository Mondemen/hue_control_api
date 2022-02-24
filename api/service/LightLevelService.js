import Service from "./Service.js";

export default class LightLevelService extends Service
{
	constructor(bridge, data)
	{
		super(bridge, data);
	}

	_setData(data, update = false)
	{
		super._setData(data, update);
		if (data.enabled != undefined)
		{
			this._data.enabled = data.enabled;
			this.emit("light_level_enabled", this._data.enabled);
		}
		if (data?.light?.light_level != undefined)
		{
			this._data.light_level = data.light_level;
			this.emit("light_level", this._data.light_level);
		}
	}

	isEnabled()
	{return (this._data.enabled)}

	getLevel()
	{return (this._data.light_level)}
}