import Service from "./Service.js";

export default class ButtonService extends Service
{
	static EventType =
	{
		INITIAL_PRESS: "initial_press",
		REPEAT: "repeat",
		SHORT_RELEASE: "short_release",
		LONG_RELEASE: "long_release",
		DOUBLE_SHORT_RELEASE: "double_short_release"
	}

	constructor(bridge, data)
	{
		super(bridge, data);
	}

	_setData(data)
	{
		super._setData(data);
		this._data.control_id = data?.metadata?.control_id ?? this._data.control_id;
		if (data?.button?.last_event)
			this.emit("last_event", this._data.control_id, this._data.last_event = data?.button?.last_event);
	}

	getControlID()
	{return (this._data.control_id)}
}