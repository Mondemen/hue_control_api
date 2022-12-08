import Color from "./Color.js"
import Mired from "./Mired.js"

/**
 * @typedef {import("./Color.js").ColorValue} ColorValue
 */

/**
 * Capabilities of light
 *
 * @readonly
 * @enum {number}
 */
export const Capabilities =
{
	STATE: "state",
	DIMMING: "dimming",
	DIMMING_DELTA: "dimming_delta",
	COLOR_TEMPERATURE: "color_temperature",
	COLOR_TEMPERATURE_DELTA: "color_temperature_delta",
	COLOR: "color",
	GRADIENT: "gradient",
	EFFECT: "effect",
	TIMED_EFFECT: "timed_effect"
}
/**
 * State of light
 *
 * @readonly
 * @enum {boolean}
 */
export const State =
{
	ON: true,
	OFF: false
}

/**
 * Mode of light
 *
 * @readonly
 * @enum {string}
 */
export const Mode =
{
	NONE: "none",
	COLOR: "color",
	COLOR_TEMPERATURE: "color_temperature",
	EFFECT: "effect",
	DYNAMIC: "dynamic",
	STREAMING: "streaming"
}

/**
 * Type of alert for light
 *
 * @readonly
 * @enum {string}
 */
export const AlertType =
{
	ONE_BREATHE: "select",
	BREATHE: "breathe",
	NONE: "none"
}

/**
 * The dynamic status
 *
 * @readonly
 * @enum {string}
 */
export const DynamicStatus =
{
	DYNAMIC_PALETTE: "dynamic_palette",
	NONE: "none"
}

/**
 * The effects
 *
 * @readonly
 * @enum {string}
 */
export const Effect =
{
	NONE: "no_effect",
	CANDLE: "candle",
	FIRE: "fire"
}

export default class LightData
{
	static Capabilities = Capabilities;
	static State = State;
	static Mode = Mode;
	static AlertType = AlertType;
	static DynamicStatus = DynamicStatus;
	static Effect = Effect;

	/**
	 * Set state of light
	 *
	 * @param {object} data The object to apply data
	 * @param {LightData.State} state The state
	 */
	static setState(data, state)
	{
		data.on = {on: state};
	}

	/**
	 * Set brightness of light
	 *
	 * @param {object} data The object to apply data
	 * @param {number} brightness The brightness
	 */
	static setBrightness(data, brightness)
	{
		data.dimming = {brightness};
	}

	/**
	 * Sets the color of light
	 *
	 * @param {object} data The object to apply data
	 * @param {Color|ColorValue} color The color
	 */
	static setColor(data, color, gamut)
	{
		if (color?.x == undefined && color.y == undefined)
			color = new Color(color).xy(gamut);
		data.color = {xy: {x: +color.x.toFixed(4), y: +color.y.toFixed(4)}};
	}

	/**
	 * Sets the color temperature of light
	 *
	 * @param {object} data The object to apply data
	 * @param {Mired|Color|ColorValue|number} mired The color temperature
	 */
	static setColorTemperature(data, mired)
	{
		if (typeof mired == "number")
			data.color_temperature = {mirek: Math.round(mired)};
		else
			data.color_temperature = {mirek: Math.round(new Mired(mired).mirek())};
	}

	/**
	 * Sets the effect of the light
	 *
	 * @param {object} data The object to apply data
	 * @param {LightData.Effect} effect The effect
	 */
	static setEffect(data, effect)
	{
		data.effects = {effect};
	}

	/**
	 * Sets the duration of a light transition or timed effects
	 *
	 * @param {object} data The object to apply data
	 * @param {number} duration The duration value between 0 and 6000000, duration in ms
	 */
	static setDuration(data, duration)
	{
		duration = Math.min(Math.max(duration, 0), 6000000);
		data.dynamics ??= {};
		data.dynamics.duration = duration;
	}
}
