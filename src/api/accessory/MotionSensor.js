import Accessory from "./Accessory.js";
import DevicePowerService from "../service/DevicePowerService.js";
import LightLevelService from "../service/LightLevelService.js";
import MotionService from "../service/MotionService.js";
import TemperatureService from "../service/TemperatureService.js";

export default class MotionSensor extends Accessory
{
	static BatteryState = DevicePowerService.BatteryState;

	/**
	 * @type {MotionService}
	 * @private
	 */
	_motion;
	/**
	 * @type {DevicePowerService}
	 * @private
	 */
	_power;
	/**
	 * @type {LightLevelService}
	 * @private
	 */
	_lightLevel;
	/**
	 * @type {TemperatureService}
	 * @private
	 */
	_temperature

	constructor(bridge, data)
	{
		super(bridge, data);
	}

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

	/**
	 * Enable or not the motion sensor
	 *
	 * @param {boolean} enabled - true if enabled, otherwise false
	 * @returns {MotionSensor|Promise} - Return this object if prepareUpdate() was called, otherwise returns Promise
	 */
	setEnabled(enabled)
	{return (this._motion.setEnabled(enabled, this))}

	getBatteryState()
	{return (this._power.getBatteryState())}

	getBatteryLevel()
	{return (this._power.getBatteryLevel())}

	getLightLevel()
	{return (this._lightLevel.getLevel())}

	isLightLevelEnabled()
	{return (this._lightLevel.isEnabled())}

	/**
	 * Enable or not the light level sensor
	 *
	 * @param {boolean} enabled - true if enabled, otherwise false
	 * @returns {MotionSensor|Promise} - Return this object if prepareUpdate() was called, otherwise returns Promise
	 */
	setLightLevelEnabled(enabled)
	{return (this._lightLevel.setEnabled(enabled, this))}

	getTemperature()
	{return (this._temperature.getTemperature())}

	isTemperatureEnabled()
	{return (this._temperature.isEnabled())}

	/**
	 * Enable or not the temperature sensor
	 *
	 * @param {boolean} enabled - true if enabled, otherwise false
	 * @returns {MotionSensor|Promise} - Return this object if prepareUpdate() was called, otherwise returns Promise
	 */
	setTemperatureEnabled(enabled)
	{return (this._temperature.setEnabled(enabled, this))}
}
