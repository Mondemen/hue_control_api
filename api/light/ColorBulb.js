import Color from "../../lib/Color.js"
import WhiteBulb from "./WhiteBulb.js";

/**
 * @typedef {import("../../lib/Color.js").ColorValue} ColorValue
 * @typedef {import("../../lib/Color.js").XYValue} XYValue
 */

export default class ColorBulb extends WhiteBulb
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
	 * @param {Color|ColorValue} value The color
	 * @returns {ColorBulb|Promise} Return this object if prepareUpdate() was called, otherwise returns Promise
	 * @throws {ArgumentError}
	 */
	setColor(value)
	{return (this._light.setColor(value, this))}

	getGradient()
	{return (this._light.getGradient(this))}
}
