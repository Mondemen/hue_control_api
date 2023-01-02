import Service from "./Service.js";

export default class RelativeRotaryService extends Service
{
	static EventAction =
	{
		START: "start",
		REPEAT: "repeat"
	}

	static EventDirection =
	{
		CLOCK_WISE: "clock_wise",
		COUNTER_CLOCK_WISE: "counter_clock_wise"
	}

	constructor(bridge, data)
	{
		super(bridge, data);
	}

	_setData(data)
	{
		super._setData(data);
		if (data?.relative_rotary?.last_event?.action)
			this.emit("last_action", this._data.action = data.relative_rotary.last_event.action);
		if (data?.relative_rotary?.last_event?.rotation?.direction)
			this.emit("last_rotation_direction", this._data.direction = data.relative_rotary.rotation.direction);
		if (data?.relative_rotary?.last_event?.rotation?.steps)
			this.emit("last_rotation_steps", this._data.steps = data.relative_rotary.rotation.steps);
		if (data?.relative_rotary?.last_event?.rotation?.duration)
			this.emit("last_rotation_duration", this._data.duration = data.relative_rotary.rotation.duration);
	}

	getControlID()
	{return (this._data.control_id)}
}
