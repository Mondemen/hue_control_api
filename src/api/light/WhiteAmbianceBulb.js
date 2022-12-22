import WhiteBulb from "./WhiteBulb.js";

/**
 * @typedef {import('./Bulb.js').EventCallback} EventCallbackInherit
 *
 * @typedef EventCallbackTypes
 * @type {Object}
 * @property {import("../service/LightService.js").ColorTemperatureEvent} color_temperature
 * @property {import("../service/LightService.js").ColorTemperatureMiredEvent} color_temperature_mired
 * @typedef {EventCallbackInherit & EventCallbackTypes} EventCallback
 */

export default class WhiteAmbianceBulb extends WhiteBulb
{
	constructor(bridge, data)
	{
		super(bridge, data);
	}

	/**
	 * @template {keyof EventCallback} T
	 * @param {T} eventName The event name
	 * @param {EventCallback[T]} listener The listener
	 */
	on(eventName, listener)
	{return (super.on(eventName, listener))}

	/**
	 * @template {keyof EventCallback} T
	 * @param {T} eventName The event name
	 * @param {EventCallback[T]} listener The listener
	 */
	once(eventName, listener)
	{return (super.once(eventName, listener))}

	getMinColorTemperature()
	{return (this._light.getMinColorTemperature())}

	getMaxColorTemperature()
	{return (this._light.getMaxColorTemperature())}

	setColorTemperature(value)
	{return (this._light.setColorTemperature(value, this))}
}
