import Service from "./Service.js";
import Mired from "../../lib/Mired.js"
import Color from "../../lib/Color.js"
import LightData from "../../lib/LightData.js";
import { checkParam } from "../../utils/index.js";
import Gradient from "../../lib/Gradient.js";
import Powerup from "../../lib/Powerup.js";

/**
 * @typedef {import("../../lib/Color.js").ColorValue} ColorValue
 * @typedef {import("../../lib/Color.js").XYValue} XYValue
 * @typedef {import("../../lib/LightData.js").Effect} Effect
 */

/**
 * @callback StateEvent
 * @param {LightService.State[keyof typeof LightService.State]} state - The state of light
 *
 * @callback BrightnessEvent
 * @param {number} brighness - The brightness of light
 *
 * @callback ColorTemperatureEvent
 * @param {Mired} mirek - The color temperature of light
 *
 * @callback ColorTemperatureMiredEvent
 * @param {number} mirek - The color temperature of light in mired format
 *
 * @callback ColorEvent
 * @param {Color} color - The color of light
 *
 * @callback ColorXYEvent
 * @param {XYValue} color - The color of light in XY format
 *
 * @callback EffectEvent
 * @param {LightService.Effect[keyof typeof LightService.Effect]} effect - The effect of light
 *
 * @callback DynamicSpeedEvent
 * @param {number} speed - The speed of dynamic scene, between 0 and 100
 *
 * @callback DynamicStatusEvent
 * @param {LightService.DynamicStatus[keyof typeof LightService.DynamicStatus]} status - The dynamic scene status
 *
 * @callback ModeEvent
 * @param {LightService.Mode[keyof typeof LightService.Mode]} mode - The mode of light
 *
 * @callback RawModeEvent
 * @param {string} mode - The raw mode of light
 */

export default class LightService extends Service
{
	static Capabilities = LightData.Capabilities;
	static State = LightData.State;
	static Mode = LightData.Mode;
	static AlertType = LightData.AlertType;
	static DynamicStatus = LightData.DynamicStatus;
	static Effect = LightData.Effect;

	/** @type {Set<LightService.Capabilities>} */
	_capabilities = new Set();
	/** @type {Gradient} */
	_gradient;
	/** @type {Powerup} */
	_powerup;

	constructor(bridge, data)
	{
		super(bridge, data);
	}

	_setData(data)
	{
		let effect;
		let modeUpdate = false;

		super._setData(data);
		if (data?.on)
			this._capabilities.add(LightService.Capabilities.STATE);
		if (data?.dimming)
			this._capabilities.add(LightService.Capabilities.DIMMING);
		if (data?.color_temperature)
			this._capabilities.add(LightService.Capabilities.COLOR_TEMPERATURE);
		if (data?.color)
			this._capabilities.add(LightService.Capabilities.COLOR);
		if (data?.gradient)
			this._capabilities.add(LightService.Capabilities.GRADIENT);
		if (data?.effects)
			this._capabilities.add(LightService.Capabilities.EFFECT);
		if (data?.timed_effects)
			this._capabilities.add(LightService.Capabilities.TIMED_EFFECT);
		if (data?.mode != undefined && this._data.mode != data.mode)
		{
			this.emit("raw_mode", this._data.mode = data.mode);
			modeUpdate = true;
		}
		if (data?.dynamics?.speed != undefined && this._data.dynamicSpeed != data?.dynamics?.speed)
			this.emit("dynamic_speed", this._data.dynamicSpeed = data.dynamics.speed);
		if (data?.dynamics?.status != undefined && this._data.dynamicStatus != data?.dynamics?.status)
		{
			this.emit("dynamic_status", this._data.dynamicStatus = data.dynamics.status);
			modeUpdate = true;
		}
		if (modeUpdate)
			this.emit("mode", this.getMode());
		if (data?.on?.on != undefined && this._data.state != data?.on?.on)
			this.emit("state", this._data.state = data.on.on);
		if (data?.dimming?.min_dim_level != undefined && this._data.minBrightness != +data.dimming.min_dim_level.toFixed(2))
			this._data.minBrightness = +data.dimming.min_dim_level.toFixed(2);
		if (data?.dimming?.brightness != undefined && this._data.brightness != +Math.max(data.dimming.brightness, this.getMinBrightness()).toFixed(2))
			this.emit("brightness", this._data.brightness = +Math.max(data.dimming.brightness, this.getMinBrightness()).toFixed(2));
		if (data?.metadata?.fixed_mired != undefined && this._data.colorTemperature != data?.metadata?.fixed_mired)
			this._data.fixed_mired = data.metadata.fixed_mired;
		if (data?.color_temperature?.mirek == null)
			this._data.colorTemperature = null;
		else if (data?.color_temperature?.mirek != undefined && this._data.colorTemperature != data?.color_temperature?.mirek)
		{
			this.emit("color_temperature", new Mired(this._data.colorTemperature = data.color_temperature.mirek));
			this.emit("color_temperature_mired", data.color_temperature.mirek);
		}
		this._data.minColorTemperature = data?.color_temperature?.mirek_schema?.mirek_minimum ?? this._data.minColorTemperature;
		this._data.maxColorTemperature = data?.color_temperature?.mirek_schema?.mirek_maximum ?? this._data.maxColorTemperature;
		this._data.colorGamut = data?.color?.gamut ?? this._data.colorGamut;
		if (data?.color?.xy && (this._data.color?.x != data?.color?.xy?.x || this._data.color?.y != data?.color?.xy?.y))
		{
			this._data.color = data.color.xy;
			this.emit("color", this.getColor());
			this.emit("color_xy", data.color.xy);
		}
		effect = data?.effects?.status ?? data?.effects?.effect;
		if (effect != undefined && this._data.effect != effect)
			this.emit("effect", this._data.effect = effect);
		if (Array.isArray(data?.effects?.status_values) && this._data.effectList != data?.effects?.status_values)
			this._data.effectList = [...data?.effects?.status_values];
		if (data?.gradient)
		{
			this._gradient ??= new Gradient(this, this);
			this._gradient._setData(data.gradient);
		}
		if (data?.powerup)
		{
			this._powerup ??= new Powerup(this);
			this._powerup._setData(data);
		}
	}

	getName()
	{return (this._data.name)}

	/**
	 * Gets the list of capabilities
	 *
	 * @returns {Set<LightService.Capabilities[keyof typeof LightService.Capabilities]>} - The list of capabilities
	 */
	getCapabilities()
	{return (this._capabilities)}

	/**
	 * Gets the state of light
	 *
	 * @returns {LightService.State[keyof typeof LightService.State]} - The state of light
	 */
	getState()
	{return (this._update.on?.on ?? this._data.state)}

	/**
	 * Set state of light
	 *
	 * @param {LightService.State[keyof typeof LightService.State]} state The state
	 * @returns {LightService|Promise} Return this object if prepareUpdate() was called, otherwise returns Promise
	 */
	setState(state, sender = this)
	{
		checkParam(this, "setState", "state", state, "boolean");
		LightData.setState(this._update, state);
		if (sender._prepareUpdate)
		{
			sender._updatedService[this.getID()] = this;
			return (sender);
		}
		return (this.update());
	}

	/**
	 * Gets the minimum brightness accepted by the light
	 *
	 * @returns {number} The minimum brightness
	 */
	getMinBrightness()
	{return (this._data.minBrightness ?? 0)}

	/**
	 * Gets the brightness of light
	 *
	 * @returns {number} - The brightness of light
	 */
	getBrightness()
	{return (Math.max(this._update.dimming?.brightness ?? this._data.brightness ?? 100, this.getMinBrightness()))}

	/**
	 * Set brightness of light
	 *
	 * @param {number} brightness - The brightness of light
	 * @returns {LightService|Promise} Return this object if prepareUpdate() was called, otherwise returns Promise
	 */
	setBrightness(brightness, sender = this)
	{
		checkParam(this, "setBrightness", "brightness", brightness, "number");
		brightness = Math.max(brightness, this.getMinBrightness());
		if (brightness < 0 || brightness > 100)
			console.warn(`${sender.constructor.name}.setBrightness(): Brightness '${brightness}' is out of range (0 <= value <= 100), sets to ${Math.min(Math.max(value, 0), 100)}`);
		LightData.setBrightness(this._update, brightness);
		if (sender._prepareUpdate)
		{
			sender._updatedService[this.getID()] = this;
			return (sender);
		}
		return (this.update());
	}

	/**
	 * Gets the minimal color temperature of light
	 *
	 * @returns {Mired} Returns the minimal color temperture
	 * @throws {ArgumentError}
	 */
	getMinColorTemperature()
	{return (new Mired(this._data.minColorTemperature))}

	/**
	 * Gets the maximal color temperature of light
	 *
	 * @returns {Mired} Returns the maximal color temperture
	 * @throws {ArgumentError}
	 */
	getMaxColorTemperature()
	{return (new Mired(this._data.maxColorTemperature))}

	/**
	 * Gets the color temperature of light
	 *
	 * @returns {Mired} Returns The color temperture
	 * @throws {ArgumentError}
	 */
	getColorTemperature()
	{return (new Mired(this._update.color_temperature?.mirek ?? this._data.colorTemperature ?? this._data.fixed_mired ?? this.getColor()))}

	/**
	 * Gets the color temperature of light in mirek format
	 *
	 * @returns {number} Returns the color
	 */
	getColorTemperatureMirek()
	{return (this._update.color_temperature?.mirek ?? this._data.colorTemperature ?? this._data.fixed_mired)}

	/**
	 * Sets the color temperature of light
	 *
	 * @param {Mired|Color|ColorValue|number} mired - The color temperature of light
	 * @returns {LightService|Promise} Return this object if prepareUpdate() was called, otherwise returns Promise
	 * @throws {ArgumentError}
	 */
	setColorTemperature(mired, sender = this)
	{
		checkParam(this, "setColorTemperature", "mired", mired, [Mired, Color, "number", "string", "object"]);
		LightData.setColorTemperature(this._update, mired);
		if (sender._prepareUpdate)
		{
			sender._updatedService[this.getID()] = this;
			return (sender);
		}
		return (this.update());
	}

	getColorGamut()
	{return (this._data.colorGamut)}

	/**
	 * Gets the color of light
	 *
	 * @returns {Color} Returns the color
	 */
	getColor()
	{
		let color = this.getColorXY();

		if (!color?.x && !color?.y)
			return (new Color("#ffe07e", this._data.colorGamut));
		return (new Color(color, this._data.colorGamut));
	}

	/**
	 * Gets the color of light in XY format
	 *
	 * @returns {XYValue} Returns the color
	 */
	getColorXY()
	{return (this._update.color?.xy ?? this._data.color)}

	/**
	 * Sets the color of light
	 *
	 * @param {Color|ColorValue} color The color
	 * @returns {LightService|Promise} Return this object if prepareUpdate() was called, otherwise returns Promise
	 * @throws {ArgumentError}
	 */
	setColor(color, sender = this)
	{
		checkParam(this, "setColor", "color", color, [Color, "string", "object"]);
		LightData.setColor(this._update, color, this._data.colorGamut);
		if (sender._prepareUpdate)
		{
			sender._updatedService[this.getID()] = this;
			return (sender);
		}
		return (this.update());
	}

	/**
	 * Gets the dynamic scene speed
	 *
	 * @returns {number} The speed of dynamic scene, between 0 and 100
	 */
	getDynamicSpeed()
	{return (this._update.dynamics?.speed ?? this._data.dynamicSpeed)}

	/**
	 * Sets the dynamic scene speed
	 *
	 * @param {number} speed The speed value between 0 and 1
	 * @returns {LightService|Promise} Return this object if prepareUpdate() was called, otherwise returns Promise
	 * @throws {ArgumentError}
	 */
	setDynamicSpeed(speed, sender = this)
	{
		checkParam(this, "setDynamicSpeed", "speed", speed, "number");
		if (speed < 0 || speed > 1)
			console.warn(`${sender.constructor.name}.setDynamicSpeed(): Speed '${speed}' is out of range (0 <= value <= 1), sets to ${Math.min(Math.max(value, 0), 1)}`);
		speed = Math.min(Math.max(speed, 0), 1);
		this._update.dynamics ??= {};
		this._update.dynamics.speed = speed;
		if (sender._prepareUpdate)
		{
			sender._updatedService[this.getID()] = this;
			return (sender);
		}
		return (this.update());
	}

	/**
	 * Gets the dynamic scene status
	 *
	 * @returns {LightService.DynamicStatus[keyof typeof LightService.DynamicStatus]} The dynamic scene status
	 */
	getDynamicStatus()
	{return (this._data.dynamicStatus)}

	/**
	 * Sets the duration of a light transition or timed effects
	 *
	 * @param {number} duration The duration value between 0 and 6000000, duration in ms
	 * @returns {LightService|Promise} Return this object if prepareUpdate() was called, otherwise returns Promise
	 * @throws {ArgumentError}
	 */
	setDuration(duration, sender = this)
	{
		checkParam(this, "setDuration", "duration", duration, "number");
		if (duration < 0 || duration > 6000000)
			console.warn(`${sender.constructor.name}.setDuration(): Duration '${duration}' is out of range (0 <= value <= 6000000), sets to ${Math.min(Math.max(value, 0), 6000000)}`);
		LightData.setDuration(this._update, duration);
		if (sender._prepareUpdate)
		{
			sender._updatedService[this.getID()] = this;
			return (sender);
		}
		return (this.update());
	}

	/**
	 * Sets the alert type to the light
	 *
	 * @param {LightService.AlertType[keyof typeof LightService.AlertType]} type The type of alert
	 * @returns {LightService|Promise} Return this object if prepareUpdate() was called, otherwise returns Promise
	 * @throws {ArgumentError}
	 */
	setAlert(type, sender = this)
	{
		checkParam(this, "setAlert", "unit", unit, LightService.AlertType, "LightService.AlertType");
		if (type == LightService.AlertType.BREATHE)
		{
			this._update.alert ??= {};
			this._update.alert.action = "lselect";
		}
		else
		{
			this._updateV1.state ??= {};
			this._updateV1.state.alert = type;
		}
		if (sender._prepareUpdate)
		{
			sender._updatedService[this.getID()] = this;
			return (sender);
		}
		return (this.update());
	}

	/**
	 * Gets the current mode of light
	 *
	 * @returns {LightService.Mode[keyof typeof LightService.Mode]} The mode of light
	 */
	getMode()
	{
		if (this._data.dynamicStatus == LightService.DynamicStatus.DYNAMIC_PALETTE)
			return (LightService.Mode.DYNAMIC);
		else if (this._data.mode == "normal")
		{
			if (this._data.effect && this._data.effect != LightService.Effect.NONE)
				return (LightService.Mode.EFFECT);
			else if (this._data.colorTemperature)
				return (LightService.Mode.COLOR_TEMPERATURE);
			else if (this._data.color)
				return (LightService.Mode.COLOR);
			return;
		}
		else if (this._data.mode == "streaming")
			return (LightService.Mode.STREAMING);
		return (LightService.Mode.NONE);
	}

	/**
	 * Gets the current raw mode of light (normal or streaming)
	 *
	 * @returns {string} The raw mode
	 */
	getRawMode()
	{return (this._data.mode)}

	/**
	 * Check if effect is enabled
	 *
	 * @returns {boolean}
	 */
	isEffectEnabled()
	{return (this._data.effect && this._data.effect != LightService.Effect.NONE)}

	/**
	 * Check if dynamic is enabled
	 *
	 * @returns {boolean}
	 */
	isDynamicEnabled()
	{return (this._data.dynamicStatus && this._data.dynamicStatus == LightService.DynamicStatus.DYNAMIC_PALETTE)}

	/**
	 * Check if streaming is enabled
	 *
	 * @returns {boolean}
	 */
	isStreamingEnabled()
	{return (this._data.mode && this._data.mode == LightService.Mode.STREAMING)}

	/**
	 * Gets the list of supported effects of light
	 *
	 * @returns {LightService.Effect[keyof typeof LightService.Effect][]} The effect list
	 */
	getEffectList()
	{return (this._data.effectList ?? [])}

	/**
	 * Check if the effect is supported by the light
	 *
	 * @param {LightService.Effect[keyof typeof LightService.Effect]} effect - The effect to check
	 * @returns {boolean} True if the effect is suported otherwise false
	 */
	isSupportEffect(effect)
	{
		this.getMode().
		checkParam(this, "isSupportEffect", "effect", effect, LightService.Effect, "LightService.Effect");
		return (this._data.effectList?.includes?.(effect));
	}

	/**
	 * Gets the current effect of light
	 *
	 * @returns {LightService.Effect[keyof typeof LightService.Effect]} The effect of light
	 */
	getEffect()
	{return (this._update.effects?.effect ?? this._data.effect)}

	/**
	 * Sets the effect of light
	 *
	 * @param {LightService.Effect[keyof typeof LightService.Effect]} effect The effect
	 * @returns {LightService|Promise} Return this object if prepareUpdate() was called, otherwise returns Promise
	 * @throws {ArgumentError}
	 */
	setEffect(effect, sender = this)
	{
		checkParam(this, "setEffect", "effect", effect, LightService.Effect, "LightService.Effect");
		LightData.setEffect(this._update, effect);
		if (sender._prepareUpdate)
		{
			sender._updatedService[this.getID()] = this;
			return (sender);
		}
		return (this.update());
	}

	getGradient(sender = this)
	{
		this._gradient ??= new Gradient(this);
		this._gradient._sender = sender;
		return (this._gradient);
	}

	getPowerup(sender = this)
	{
		this._powerup ??= new Powerup(this);
		this._powerup._sender = sender;
		return (this._powerup);
	}

	async update()
	{
		if (this._gradient)
			this._update = {...this._update, ...this._gradient._getData()};
		if (this._powerup)
			this._update = {...this._update, ...this._powerup._getData()};
		await super.update();
	}
}
