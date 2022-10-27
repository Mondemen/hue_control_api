import Service from "./Service.js";

export default class BridgeService extends Service
{
	constructor(bridge, data)
	{
		super(bridge, data);
	}

	_setData(data, update = false)
	{
		super._setData(data, update);
		this._data.id = data?.bridge_id ?? this._data.id;
		this._data.timezone = data?.time_zone?.time_zone ?? this._data.timezone;
	}

	getBridgeID()
	{return (this._data.id)}
}