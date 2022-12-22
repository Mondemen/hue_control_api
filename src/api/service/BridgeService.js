import Service from "./Service.js";

export default class BridgeService extends Service
{
	constructor(bridge, data)
	{
		super(bridge, data);
	}

	_setData(data)
	{
		super._setData(data);
		this._data.bridge_id = data?.bridge_id ?? this._data.bridge_id;
		if (data?.time_zone?.time_zone)
			this.emit("timezone", this._data.timezone = data?.time_zone?.time_zone);
	}

	getBridgeID()
	{return (this._data.bridge_id)}
}