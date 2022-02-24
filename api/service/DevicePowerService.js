import Service from "./Service.js";

/**
 * @typedef {import('../accessory/MotionSensor.js').default} MotionSensor
 */
export default class DevicePowerService extends Service
{
	static BatteryState =
	{
		NORMAL: "normal",
		LOW: "low",
		CRITICAL: "critical"
	}

	constructor(bridge, data)
	{
		super(bridge, data);
	}

	_setData(data, update = false)
	{
		super._setData(data, update);
		if (data?.power_state?.battery_state)
		{
			this._data.battery_state = data.power_state.battery_state;
			this.emit("battery_state", this._data.battery_state)
		}
		if (data?.power_state?.battery_level)
		{
			this._data.battery_level = data.power_state.battery_level;
			this.emit("battery_level", this._data.battery_level)
		}
	}

	/**
	 * Gets the battery state
	 * 
	 * @returns {DevicePowerService.BatteryState} The battery state
	 */
	getBatteryState()
	{return (this._data.battery_state)}

	/**
	 * Gets the battery level
	 * 
	 * @returns {number} The battery level un percent
	 */
	getBatteryLevel()
	{return (this._data.battery_level)}
}