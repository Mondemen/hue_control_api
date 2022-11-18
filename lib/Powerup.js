import { checkParam } from "../utils/index.js";
import Color from "./Color.js";
import LightData from "./LightData.js";
import Mired from "./Mired.js";

/**
 * @typedef {import('../api/service/LightService.js').default} LightService
 * @typedef {import("./Color.js").ColorValue} ColorValue
 */

export default class Powerup
{
	/**
	 * @type {LightService}
	 * @private
	 */
	_light;
	/** @private */
	_data = {};
	/** @private */
	_update = {};

	static State = LightData.State;

	/**
	 * @enum {string}
	 * @readonly
	 */
	static Preset =
	{
		POWERFAIL: "powerfail",
		SAFETY: "safety",
		LAST_ON_STATE: "last_on_state",
		CUSTOM: "custom"
	}

	/**
	 * @enum {string}
	 * @readonly
	 */
	static StateMode =
	{
		PREVIOUS: "previous",
		ON: "on"
	}

	/**
	 * @enum {string}
	 * @readonly
	 */
	static DimmingMode =
	{
		PREVIOUS: "previous",
		DIMMING: "dimming"
	}

	/**
	 * @enum {string}
	 * @readonly
	 */
	static ColorMode =
	{
		PREVIOUS: "previous",
		COLOR: "color",
		COLOR_TEMPERATURE: "color_temperature"
	}

	constructor(light)
	{
		this._light = light;
	}

	/**
	 * @private
	 */
	_setData(data)
	{
		if (data?.powerup)
		{
			if (data.powerup?.preset != undefined && this._data.preset != data.powerup.preset)
				this._light.emit("powerup_preset", this._data.preset = data.powerup.preset);
			if (data.powerup?.configured != undefined && this._data.configured != data.powerup.configured)
				this._light.emit("powerup_configured", this._data.configured = data.powerup.configured);
			if (data.powerup?.on)
			{
				if (data.powerup.on?.mode != undefined && this._data.stateMode != data.powerup.on.mode)
					this._light.emit("powerup_state_mode", this._data.stateMode = data.powerup.on.mode);
				if (data.powerup.on?.on?.on != undefined && this._data.state != data.powerup.on.on.on)
					this._light.emit("powerup_state", this._data.state = data.powerup.on.on.on);
			}
			if (data.powerup?.dimming)
			{
				if (data.powerup.dimming?.mode != undefined && this._data.dimmingMode != data.powerup.dimming.mode)
					this._light.emit("powerup_dimming_mode", this._data.dimmingMode = data.powerup.dimming.mode);
				if (data.powerup.dimming?.dimming?.brightness != undefined && this._data.brightness != data.powerup.dimming.dimming.brightness)
					this._light.emit("powerup_brightness", this._data.brightness = data.powerup.dimming.dimming.brightness);
			}
			if (data.powerup?.color)
			{
				if (data.powerup.color?.mode != undefined && this._data.colorMode != data.powerup.color.mode)
					this._light.emit("powerup_color_mode", this._data.colorMode = data.powerup.color.mode);
				if (data.powerup.color?.color?.xy && (this._data.color?.xy?.x != data.powerup.color?.color?.xy?.x || this._data.color?.xy?.y != data.powerup.color?.color?.xy?.y))
					this._light.emit("powerup_color", new Color(this._data.color = data.powerup.color.color.xy));
				if (data.powerup.color.color_temperature?.mirek != undefined && this._data.colorTemperature != data.powerup.color.color_temperature?.mirek)
					this._light.emit("powerup_color_temperature", new Mired(this._data.colorTemperature = data.powerup.color.color_temperature.mirek));
			}
		}
	}

	/**
	 * @private
	 */
	_getData()
	{
		if (this._update && Object.keys(this._update).length)
			return ({powerup: this._update});
	}

	/**
	 * Set state when device is reconnected
	 *
	 * @param {Powerup.State[keyof typeof Powerup.State]} state The state
	 * @returns {Powerup|Promise} Return this object if prepareUpdate() was called, otherwise returns Promise
	 */
	setState(state)
	{
		checkParam(this, "setState", "state", state, "boolean");
		this._update.preset = Powerup.Preset.CUSTOM;
		this._update.on ??= {};
		this._update.on.mode = Powerup.StateMode.ON;
		LightData.setState(this._update.on, state);
		if (this._sender._prepareUpdate)
		{
			this._sender._updatedService[this._light.getID()] = this._light;
			return (this);
		}
		return (this._light.update());
	}

	/**
	 * Restore previous state when device is reconnected
	 *
	 * @returns {Powerup|Promise} Return this object if prepareUpdate() was called, otherwise returns Promise
	 */
	restorePreviousState()
	{
		this._update.preset = Powerup.Preset.CUSTOM;
		this._update.on ??= {};
		this._update.on.mode = Powerup.StateMode.PREVIOUS;
		if (this._sender._prepareUpdate)
		{
			this._sender._updatedService[this._light.getID()] = this._light;
			return (this);
		}
		return (this._light.update());
	}

	/**
	 * Get curent state mode
	 *
	 * @returns {Powerup.StateMode[keyof typeof Powerup.StateMode]}
	 */
	getStateMode()
	{return (this._update.on?.mode ?? this._data.stateMode)}

	/**
	 * Get current state
	 *
	 * @returns {Powerup.State[keyof typeof Powerup.State]}
	 */
	getState()
	{return (this._update.on?.on?.on ?? this._data.state)}

	/**
	 * Set brightness when device is reconnected
	 *
	 * @param {number} brightness The brightness
	 * @returns {Powerup|Promise} Return this object if prepareUpdate() was called, otherwise returns Promise
	 */
	setBrightness(brightness)
	{
		checkParam(this, "setBrightness", "brightness", brightness, "number");
		brightness = Math.max(brightness, this._light.getMinBrightness());
		if (brightness < 0 || brightness > 100)
			console.warn(`${this._sender.constructor.name}.setBrightness(): Brightness '${brightness}' is out of range (0 <= value <= 100), sets to ${Math.min(Math.max(value, 0), 100)}`);
		this._update.preset = Powerup.Preset.CUSTOM;
		this._update.dimming ??= {};
		this._update.dimming.mode ??= Powerup.DimmingMode.DIMMING;
		LightData.setBrightness(this._update.dimming, brightness);
		if (this._sender._prepareUpdate)
		{
			this._sender._updatedService[this._light.getID()] = this._light;
			return (this);
		}
		return (this._light.update());
	}

	/**
	 * Restore previous brightness when device is reconnected
	 *
	 * @returns {Powerup|Promise} Return this object if prepareUpdate() was called, otherwise returns Promise
	 */
	restorePreviousBrightness()
	{
		this._update.preset = Powerup.Preset.CUSTOM;
		this._update.dimming ??= {};
		this._update.dimming.mode = Powerup.DimmingMode.PREVIOUS;
		if (this._sender._prepareUpdate)
		{
			this._sender._updatedService[this._light.getID()] = this._light;
			return (this);
		}
		return (this._light.update());
	}

	/**
	 * Get curent dimming mode
	 *
	 * @returns {Powerup.DimmingMode[keyof typeof Powerup.DimmingMode]}
	 */
	getDimmingMode()
	{return (this._update.dimming?.mode ?? this._data.dimmingMode)}

	/**
	 * Get current brightness
	 *
	 * @returns {number}
	 */
	getBrightness()
	{return (Math.max(this._update.dimming?.brightness ?? this._data.brightness ?? 100, this._light.getMinBrightness()))}

	/**
	 * Sets the color temperature when device is reconnected
	 *
	 * @param {Mired|Color|ColorValue|number} mired The color temperature
	 * @returns {Powerup|Promise} Return this object if prepareUpdate() was called, otherwise returns Promise
	 * @throws {ArgumentError}
	 */
	setColorTemperature(mired)
	{
		checkParam(this, "setColorTemperature", "mired", mired, [Mired, Color, "number", "string", "object"]);
		this._update.preset = Powerup.Preset.CUSTOM;
		this._update.color ??= {};
		this._update.color.mode ??= Powerup.ColorMode.COLOR_TEMPERATURE;
		LightData.setColorTemperature(this._update.color, mired);
		if (this._sender._prepareUpdate)
		{
			this._sender._updatedService[this._light.getID()] = this._light;
			return (this);
		}
		return (this._light.update());
	}

	/**
	 * Sets the color when device is reconnected
	 *
	 * @param {Color|ColorValue} color The color
	 * @returns {Powerup|Promise} Return this object if prepareUpdate() was called, otherwise returns Promise
	 * @throws {ArgumentError}
	 */
	setColor(color)
	{
		checkParam(this, "setColor", "color", color, [Color, "string", "object"]);
		this._update.preset = Powerup.Preset.CUSTOM;
		this._update.color ??= {};
		this._update.color.mode ??= Powerup.ColorMode.COLOR;
		LightData.setColor(this._update.color, color, this._light._data.colorGamut);
		if (this._sender._prepareUpdate)
		{
			this._sender._updatedService[this._light.getID()] = this._light;
			return (this);
		}
		return (this._light.update());
	}

	/**
	 * Restore previous color/color temperature when device is reconnected
	 *
	 * @returns {Powerup|Promise} Return this object if prepareUpdate() was called, otherwise returns Promise
	 */
	restorePreviousColor()
	{
		this._update.preset = Powerup.Preset.CUSTOM;
		this._update.color ??= {};
		this._update.color.mode = Powerup.ColorMode.PREVIOUS;
		if (this._sender._prepareUpdate)
		{
			this._sender._updatedService[this._light.getID()] = this._light;
			return (this);
		}
		return (this._light.update());
	}

	/**
	 * Get curent color mode
	 *
	 * @returns {Powerup.ColorMode[keyof typeof Powerup.ColorMode]}
	 */
	getColorMode()
	{return (this._update.color?.mode ?? this._data.colorMode)}

	/**
	 * Gets the color temperature of light
	 *
	 * @returns {Mired} Returns the color temperature
	 */
	getColorTemperature()
	{
		let mirek = this._update.color?.color_temperature?.mirek ?? this._data.colorTemperature;

		if (mirek)
			return (new Mired(mirek));
	}

	/**
	 * Gets the color of light
	 *
	 * @returns {Color} Returns the color
	 */
	getColor()
	{
		let color = this._update.color?.color?.xy ?? this._data.color;

		if (color)
			return (new Color(color, this._light._data.colorGamut));
	}

	/**
	 * Apply powerup preset
	 *
	 * @param {Powerup.Preset[keyof typeof Powerup.Preset]} preset - The preset
	 */
	setPreset(preset)
	{
		switch (preset)
		{
			case Powerup.Preset.POWERFAIL:
			{
				this._update.preset = preset;
				this._update.on = {mode: Powerup.StateMode.PREVIOUS};
				this._update.dimming = {mode: Powerup.DimmingMode.PREVIOUS};
				this._update.color = {mode: Powerup.ColorMode.PREVIOUS};
				break;
			}
			case Powerup.Preset.SAFETY:
			{
				this._update.preset = preset;
				this._update.on = {mode: Powerup.StateMode.ON};
				LightData.setState(this._update.on, Powerup.State.ON);
				this._update.dimming = {mode: Powerup.DimmingMode.DIMMING};
				LightData.setBrightness(this._update.dimming, 100);
				this._update.color = {mode: Powerup.ColorMode.COLOR_TEMPERATURE};
				LightData.setColorTemperature(this._update.color, 366);
				break;
			}
			case Powerup.Preset.LAST_ON_STATE:
			{
				this._update.preset = preset;
				this._update.on = {mode: Powerup.StateMode.ON};
				LightData.setState(this._update.on, Powerup.State.ON);
				this._update.dimming = {mode: Powerup.DimmingMode.PREVIOUS};
				this._update.color = {mode: Powerup.ColorMode.PREVIOUS};
				break;
			}
		}
	}
}
