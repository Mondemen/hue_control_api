import Color from "../../lib/Color.js";
import LightService from "../service/LightService.js";
import WhiteAmbianceBulb from "./WhiteAmbianceBulb.js";

/**
 * @typedef {import("../../lib/Color.js").ColorValue} ColorValue
 * @typedef {import("../../lib/Color.js").XYValue} XYValue
 * @typedef {import('./WhiteAmbianceBulb.js').EventCallback} EventCallbackInherit
 *
 * @typedef EventCallbackTypes
 * @type {Object}
 * @property {import("../service/LightService.js").ColorEvent} color
 * @property {import("../service/LightService.js").ColorXYEvent} color_xy
 * @property {import("../../lib/Gradient.js").GradientColorEvent} gradient_color
 * @property {import("../../lib/Gradient.js").GradientColorXYEvent} gradient_color_xy
 * @typedef {EventCallbackInherit & EventCallbackTypes} EventCallback
 */

export default class WhiteAndColorBulb extends WhiteAmbianceBulb
{
	constructor(bridge, data)
	{
		super(bridge, data);
		this.on("")
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

	/**
	 * Gets the color of light
	 *
	 * @returns {Color} Returns the color
	 */
	getColor()
	{return (this._light.getColor())}

	/**
	 * Gets the color of light in XY format
	 *
	 * @returns {XYValue} Returns the color
	 */
	getColorXY()
	{return (this._light.getColorXY())}

	/**
	 * Sets the color of light
	 *
	 * @param {Color|ColorValue} color The color
	 * @returns {LightService|Promise} Return this object if prepareUpdate() was called, otherwise returns Promise
	 * @throws {ArgumentError}
	 */
	setColor(color)
	{return (this._light.setColor(color, this))}

	getGradient()
	{return (this._light.getGradient(this))}
}
