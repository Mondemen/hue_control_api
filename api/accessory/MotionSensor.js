import Accessory from "./Accessory.js";
import DevicePowerService from "../service/DevicePowerService.js";
import LightLevelService from "../service/LightLevelService.js";
import MotionService from "../service/MotionService.js";
import TemperatureService from "../service/TemperatureService.js";

export default class MotionSensor extends Accessory
{
	static BatteryState = DevicePowerService.BatteryState;

	/** @type {MotionService} */
	_motion;
	/** @type {DevicePowerService} */
	_power;
	/** @type {LightLevelService} */
	_lightLevel;
	/** @type {TemperatureService} */
	_temperature

	constructor(bridge, data)
	{
		super(bridge, data);
	}

	/**
	 * Adds the listener function to the end of the listeners array for the event named eventName
	 * 
	 * @param {"motion"|"battery_state"|"battery_level"|"light_level_enabled"|"light_level"|"temperature_enabled"|"temperature"} eventName The event name
	 * @param {on} listener
	 */
	on(eventName, listener)
	{super.on(eventName, listener)}

	_addService(service)
	{
		super._addService(service);
		if (service instanceof MotionService)
			this._motion = service;
		else if (service instanceof DevicePowerService)
			this._power = service;
		else if (service instanceof LightLevelService)
			this._lightLevel = service;
		else if (service instanceof TemperatureService)
			this._temperature = service;
	}

	isEnabled()
	{return (this._motion.isEnabled())}

	/** @todo Add service method */
}