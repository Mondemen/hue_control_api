import Service from "./Service.js";

export default class MotionService extends Service
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
			this.emit("enabled", this._data.enabled);
		}
		if (data?.motion?.motion)
			this.emit("motion");
	}

	isEnabled()
	{return (this._data.enabled)}
}