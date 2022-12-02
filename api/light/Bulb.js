import LightService from "../service/LightService.js";
import Plug from "./Plug.js";

export default class Bulb extends Plug
{
	static Effect = LightService.Effect;
	static DynamicStatus = LightService.DynamicStatus;

	constructor(bridge, data)
	{
		super(bridge, data);
	}

	/**
	 * Gets the minimum brightness accepted by the light
	 *
	 * @returns {number} The minimum brightness
	 */
	getMinBrightness()
	{return (this._light.getMinBrightness())}

	/**
	 * Gets the brightness of light
	 *
	 * @returns {number} The brightness of light
	 */
	getBrightness()
	{return (Math.max(this._light.getBrightness() ?? 0, this.getMinBrightness()))}

	/**
	 * Set brightness of light
	 *
	 * @param {number} brightness The brightness
	 * @returns {Light|Promise} Return this object if prepareUpdate() was called, otherwise returns Promise
	 */
	setBrightness(brightness)
	{return (this._light.setBrightness(brightness, this))}

	/**
	 * Gets the current effect of the light
	 *
	 * @returns {Bulb.Effect[keyof typeof Bulb.Effect]} The effect
	 */
	getEffect()
	{return (this._light.getEffect())}

	/**
	 * Gets the list of supported effects of the light
	 *
	 * @returns {Bulb.Effect[keyof typeof Bulb.Effect][]} The effect list
	 */
	getEffectList()
	{return (this._light.getEffectList())}

	/**
	 * Check if the effect is supported by the light
	 *
	 * @param {Bulb.Effect[keyof typeof Bulb.Effect]} effect The effect to check
	 * @returns {boolean} True if the effect is suported otherwise false
	 */
	isSupportEffect()
	{return (this._light.isSupportEffect())}

	/**
	 * Set effect of light
	 *
	 * @param {Bulb.Effect[keyof typeof Bulb.Effect]} effect The effect
	 * @returns {Light|Promise} Return this object if prepareUpdate() was called, otherwise returns Promise
	 */
	setEffect(effect)
	{return (this._light.setEffect(effect, this))}

	/**
	 * Gets the dynamic scene status
	 *
	 * @returns {Bulb.DynamicStatus[keyof typeof Bulb.DynamicStatus]} The dynamic scene status
	 */
	getDynamicStatus()
	{return (this._light.getDynamicStatus())}

	/**
	 * Gets the dynamic scene speed
	 *
	 * @returns {number} The speed of dynamic scene, between 0 and 100
	 */
	getDynamicSpeed()
	{return (this._light.getDynamicSpeed())}

	/**
	 * Check if effect is enabled
	 *
	 * @returns {boolean}
	 */
	isEffectEnabled()
	{return (this._light.isEffectEnabled())}

	/**
	 * Check if dynamic is enabled
	 *
	 * @returns {boolean}
	 */
	isDynamicEnabled()
	{return (this._light.isDynamicEnabled())}

	/**
	 * Check if streaming is enabled
	 *
	 * @returns {boolean}
	 */
	isStreamingEnabled()
	{return (this._light.isStreamingEnabled())}
}
