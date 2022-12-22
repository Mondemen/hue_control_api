import Light from "../api/light/Light.js";
import Color from "./Color.js";
import Mired from "./Mired.js";
import LightData from "./LightData.js";
import {checkParam} from "../utils/index.js";
import Gradient from "./Gradient.js";

/**
 * @typedef {import('../api/service/LightService.js').default} LightService
 * @typedef {import('../api/light/Bulb.js').default} Bulb
 * @typedef {import('../api/light/WhiteAmbianceBulb.js').default} WhiteAmbianceBulb
 * @typedef {import('../api/light/ColorBulb.js').default} ColorBulb.js
 * @typedef {import('../api/light/WhiteAndColorBulb.js').default} WhiteAndColorBulb.js
 * @typedef {import('../api/Scene.js').default} Scene
 * @typedef {import("./Color.js").ColorValue} ColorValue
 * @typedef {import("./Color.js").XYValue} XYValue
 */

/**
 * @callback ActionStateEvent
 * @param {Light} light - Light attached to the action
 * @param {LightService.State[keyof typeof LightService.State]} state - The state of light
 *
 * @callback ActionBrightnessEvent
 * @param {Bulb} light - Light attached to the action
 * @param {number} brighness - The brightness of light
 *
 * @callback ActionColorTemperatureEvent
 * @param {WhiteAmbianceBulb} light - Light attached to the action
 * @param {Mired} mirek - The color temperature of light
 *
 * @callback ActionColorTemperatureMiredEvent
 * @param {WhiteAmbianceBulb} light - Light attached to the action
 * @param {number} mirek - The color temperature of light in mired format
 *
 * @callback ActionColorEvent
 * @param {ColorBulb|WhiteAndColorBulb} light - Light attached to the action
 * @param {Color} color - The color of light
 *
 * @callback ActionColorXYEvent
 * @param {ColorBulb|WhiteAndColorBulb} light - Light attached to the action
 * @param {XYValue} color - The color of light in XY format
 *
 * @callback ActionEffectEvent
 * @param {Bulb} light - Light attached to the action
 * @param {LightService.Effect[keyof typeof LightService.Effect]} effect - The effect of light
 *
 * @callback ActionDuration
 * @param {Light} light - Light attached to the action
 * @param {number} duration - The duration of transition
 */

export default class SceneAction
{
	/**
	 * @type {Scene}
	 * @private
	 */
	_scene;
	/**
	 * @type {Light}
	 * @private
	 */
	_light;
	/**
	 * @type {Gradient}
	 * @private
	 */
	_gradient;
	/** @private */
	_data = {};
	/** @private */
	_update = {};
	/** @private */
	_updated = false;

	constructor(scene, light)
	{
		this._scene = scene;
		this._light = light;
		LightData.setState(this._data, true);
	}

	/**
	 * @private
	 */
	_setData(data)
	{
		if (data?.on?.on != undefined && this._data?.on?.on != data?.on?.on)
		{
			LightData.setState(this._data, data.on.on);
			this._scene.emit("action_state", this._light, this.getState());
		}
		if (data?.dimming?.brightness != undefined && this._data?.dimming?.brightness != data.dimming.brightness)
		{
			LightData.setBrightness(this._data, data.dimming.brightness);
			this._scene.emit("action_brightness", this._light, this.getBrightness());
		}
		if (data?.color_temperature?.mirek != undefined && this._data?.color_temperature?.mirek != data?.color_temperature?.mirek)
		{
			LightData.setColorTemperature(this._data, data.color_temperature.mirek);
			this._scene.emit("action_color_temperature", this._light, this.getColorTemperature());
			this._scene.emit("action_color_temperature_mired", this._light, data.color_temperature.mirek);
		}
		if (data?.color?.xy && (this._data.color?.xy?.x != data?.color?.xy?.x || this._data.color?.xy?.y != data?.color?.xy?.y))
		{
			LightData.setColor(this._data, data.color.xy);
			this._scene.emit("action_color", this._light, this.getColor());
			this._scene.emit("action_color_xy", this._light, data.color.xy);
		}
		if (data?.effects?.effect != undefined && this._data?.effects?.effect != data?.effects?.effect)
		{
			LightData.setEffect(this._data, data.effects.effect);
			this._scene.emit("action_effect", this._light, this.getEffect());
		}
		if (data?.dynamics?.duration != undefined && this._data?.dynamics?.duration != data?.dynamics?.duration)
		{
			LightData.setDuration(this._data, data.dynamics.duration);
			this._scene.emit("action_duration", this._light, this.getDuration());
		}
		if (data?.gradient)
		{
			this._gradient ??= new Gradient(this._scene, this._light);
			this._gradient._setData(data.gradient);
		}
	}

	/**
	 * @private
	 */
	_getData()
	{
		let result =
		{
			target:
			{
				rid: this._light._light.getID(),
				rtype: this._light._light.getType()
			},
			action: (this._scene.isExists()) ? this._update : this._data
		}

		if (this._gradient)
			result.action = {...result.action, ...this._gradient._getData()};
		return (result);
	}

	getLight()
	{return (this._light)}

	/**
	 * Gets the state of light
	 *
	 * @returns {LightData.State[keyof typeof LightData.State]} The state of light
	 */
	getState()
	{return (this._update.on?.on ?? this._data.on?.on)}

	/**
	 * Set state of light
	 *
	 * @param {LightData.State[keyof typeof LightData.State]} state The state
	 * @returns {SceneAction} Return this object
	 * @throws {ArgumentError}
	 */
	setState(state)
	{
		checkParam(this, "setState", "state", state, "boolean");
		if (this._scene.isExists())
		{
			LightData.setState(this._update, state);
			this._updated = true;
			if (!this._scene._prepareUpdate)
				return (this._scene.update());
		}
		else
			LightData.setState(this._data, state);
		return (this);
	}

	/**
	 * Gets the brightness of light
	 *
	 * @returns {number} The brightness of light
	 */
	getBrightness()
	{return (this._update.dimming?.brightness ?? this._data.dimming?.brightness)}

	/**
	 * Set brightness of light
	 *
	 * @param {number} brightness - The brightness
	 * @returns {SceneAction} Return this object
	 * @throws {ArgumentError}
	 */
	setBrightness(brightness)
	{
		checkParam(this, "setBrightness", "brightness", brightness, "number");
		if (!this._light.getCapabilities().has(LightData.Capabilities.DIMMING))
			throw new Error(`The light '${this._light.getID()}' (${this._light.getName()}) don't have the capability to set the brighness`);
		if (this._scene.isExists())
		{
			LightData.setBrightness(this._update, brightness);
			this._updated = true;
			if (!this._scene._prepareUpdate)
				return (this._scene.update());
		}
		else
			LightData.setBrightness(this._data, brightness);
		return (this);
	}

	/**
	 * Gets the color temperature of light
	 *
	 * @returns {Color} Returns the color
	 */
	getColor()
	{
		if (!this._data.color?.xy?.x && !this._data.color?.xy?.y)
			return;
		return (new Color(this._update.color?.xy ?? this._data.color?.xy));
	}

	/**
	 * Sets the color of light
	 *
	 * @param {Color|ColorValue} color - The color
	 * @returns {SceneAction} Return this object
	 * @throws {ArgumentError}
	 */
	setColor(color)
	{
		checkParam(this, "setColor", "color", color, [Color, "string", "object"]);
		if (!this._light.getCapabilities().has(LightData.Capabilities.COLOR))
			throw new Error(`The light '${this._light.getID()}' (${this._light.getName()}) don't have the capability to set the color`);
		if (this._scene.isExists())
		{
			LightData.setColor(this._update, color, this._light._light.getColorGamut());
			this._updated = true;
			if (!this._scene._prepareUpdate)
				return (this._scene.update());
		}
		else
			LightData.setColor(this._data, color, this._light._light.getColorGamut());
		return (this);
	}

	/**
	 * Gets the color temperature of light
	 *
	 * @returns {Mired} Returns The color temperture
	 * @throws {ArgumentError}
	 */
	getColorTemperature()
	{
		if (!this._data.color_temperature?.mirek)
			return;
		return (new Mired(this._update.color_temperature?.mirek ?? this._data.color_temperature.mirek))
	}

	/**
	 * Sets the color temperature of light
	 *
	 * @param {Mired|Color|ColorValue|number} mired The color temperature
	 * @returns {SceneAction} Return this object
	 * @throws {ArgumentError}
	 */
	setColorTemperature(mired)
	{
		checkParam(this, "setColorTemperature", "mired", mired, [Mired, "string", "object"]);
		if (this._scene.isExists())
		{
			LightData.setColorTemperature(this._update, mired);
			this._updated = true;
			if (!this._scene._prepareUpdate)
				return (this._scene.update());
		}
		else
			LightData.setColorTemperature(this._data, mired);
		return (this);
	}

	/**
	 * Gets the current effect of the light
	 *
	 * @returns {LightData.Effect[keyof typeof LightData.Effect]} The effect
	 */
	getEffect()
	{return (this._update.effects?.effect ?? this._data.effects?.effect)}

	/**
	 * Sets the effect of the light
	 *
	 * @param {LightData.Effect[keyof typeof LightData.Effect]} effect The effect
	 * @returns {SceneAction} Return this object
	 * @throws {ArgumentError}
	 */
	setEffect(effect)
	{
		checkParam(this, "setEffect", "effect", effect, LightData.Effect, "LightData.Effect");
		if (this._scene.isExists())
		{
			LightData.setEffect(this._update, effect);
			this._updated = true;
			if (!this._scene._prepareUpdate)
				return (this._scene.update());
		}
		else
			LightData.setEffect(this._data, effect);
		return (this);
	}

	getGradient()
	{
		this._gradient ??= new Gradient(this._scene);
		this._gradient._sender = this._scene;
		return (this._gradient);
	}

	/**
	 * Sets the duration of a light transition or timed effects
	 *
	 * @returns {number} The duration value between 0 and 6000000, duration in ms
	 */
	getDuration()
	{return (this._update.dynamics?.duration ?? this._data.dynamics?.duration)}

	/**
	 * Sets the duration of a light transition or timed effects
	 *
	 * @param {number} duration The duration value between 0 and 6000000, duration in ms
	 * @returns {SceneAction} Return this object
	 * @throws {ArgumentError}
	 */
	setDuration(duration)
	{
		checkParam(this, "setDuration", "duration", duration, "number");
		if (duration < 0 || duration > 6000000)
			console.warn(`${sender.constructor.name}.setDuration(): Duration '${duration}' is out of range (0 <= value <= 6000000), sets to ${Math.min(Math.max(value, 0), 6000000)}`);
		if (this._scene.isExists())
		{
			LightData.setDuration(this._update, duration);
			this._updated = true;
			if (!this._scene._prepareUpdate)
				return (this._scene.update());
		}
		else
			LightData.setDuration(this._data, duration);
		return (this);
	}

	/**
	 * Gets the current mode of the action
	 *
	 * @returns {LightData.Mode[keyof typeof LightData.Mode]} The mode
	 */
	getMode()
	{
		if (this._light.getCapabilities().has(Light.Capabilities.COLOR) && this.getColor())
			return (LightData.Mode.COLOR);
		else if (this._light.getCapabilities().has(Light.Capabilities.COLOR_TEMPERATURE) && this.getColorTemperature())
			return (LightData.Mode.COLOR_TEMPERATURE);
		else if (this._light.getCapabilities().has(Light.Capabilities.EFFECT) && this.getEffect() && this.getEffect() != LightData.Effect.NONE)
			return (LightData.Mode.EFFECT);
		return (LightData.Mode.NONE);
	}
}
