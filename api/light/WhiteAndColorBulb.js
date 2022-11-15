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
	 * 
	 * @returns {Color}
	 */
	getColor()
	{return (this._light.getColor())}

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
