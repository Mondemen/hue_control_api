import Color from "../../lib/Color.js";
import LightService from "../service/LightService.js";
import WhiteAmbianceBulb from "./WhiteAmbianceBulb.js";

/** @typedef {import("../service/LightService.js").ColorValue} ColorValue */

export default class WhiteAndColorBulb extends WhiteAmbianceBulb
{
	constructor(bridge, data)
	{
		super(bridge, data);
	}

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
