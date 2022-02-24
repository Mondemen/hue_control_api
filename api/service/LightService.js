import Service from "./Service.js";
import Mired from "../../lib/Mired.js"
import Color from "../../lib/Color.js"
import ArgumentError from "../../lib/error/ArgumentError.js";
import { checkParam } from "../../utils/index.js";

export default class LightService extends Service
{
	/**
	 * Capabilities of light
	 * 
	 * @enum {string}
	 * @readonly
	 */
	static Capabilities =
	{
		STATE: "state",
		DIMMING: "dimming",
		COLOR_TEMPERATURE: "color_temperature",
		COLOR: "color"
	}
	/**
	 * State of light
	 * 
	 * @enum {boolean}
	 * @readonly
	 */
	static State =
	{
		ON: true,
		OFF: false
	}

	/**
	 * Mode of light
	 * 
	 * @enum {string}
	 * @readonly
	 */
	static Mode =
	{
		NORMAL: "normal",
		STREAMING: "streaming"
	}

	/**
	 * Type of alert for light
	 * 
	 * @enum {string}
	 * @readonly
	 */
	static AlertType =
	{
		ONE_BREATHE: "select",
		BREATHE: "breathe",
		NONE: "none"
	}

	/**
	 * The unit of color
	 * 
	 * @enum {string}
	 * @readonly
	 */
	static ColorTemperatureUnit =
	{
		MIRED: "mired",
		KELVIN: "kelvin",
		RGB: "rgb",
		HEX: "hex"
	}

	/**
	 * The unit of color
	 * 
	 * @enum {string}
	 * @readonly
	 */
	static ColorUnit =
	{
		RGB: "rgb",
		HEX: "hex",
		XY: "xy"
	}

	/**
	 * The dynamic status
	 * 
	 * @enum {string}
	 * @readonly
	 */
	static DynamicStatus =
	{
		DYNAMIC_PALETTE: "dynamic_palette",
		NONE: "none"
	}

	constructor(bridge, data)
	{
		super(bridge, data);
	}

	_setData(data, update = false)
	{
		let color, brightness;
		super._setData(data, update);
		this._data.name = data?.metadata?.name ?? this._data.name;
		this._data.archetype = data?.metadata?.archetype ?? this._data.archetype;
		if (!update)
		{
			this._capabilities = [];
			if (data?.on)
				this._capabilities.push(LightService.Capabilities.STATE);
			if (data?.dimming)
				this._capabilities.push(LightService.Capabilities.DIMMING);
			if (data?.color_temperature)
				this._capabilities.push(LightService.Capabilities.COLOR_TEMPERATURE);
			if (data?.color)
				this._capabilities.push(LightService.Capabilities.COLOR);
		}

		if (data?.mode)
			this.emit("mode", this._data.mode = data.mode)
		if (data?.on?.on != undefined && this._data.state != data?.on?.on)
			this.emit("state", this._data.state = data.on.on);
		if (data?.dimming?.min_dim_level != undefined && this._data.minBrightness != +data.dimming.min_dim_level.toFixed(2))
			this._data.minBrightness = +data.dimming.min_dim_level.toFixed(2);
		if (data?.dimming?.brightness != undefined && this._data.brightness != +Math.max(data.dimming.brightness, this.getMinBrightness()).toFixed(2))
		{
			this.emit("brightness", this._data.brightness = +Math.max(data.dimming.brightness, this.getMinBrightness()).toFixed(2));
			brightness = true;
		}
		if (data?.color_temperature?.mirek != undefined && this._data.colorTemperature != data?.color_temperature?.mirek)
		{
			this.emit("color_temperature", this._data.colorTemperature = data.color_temperature.mirek);
			color = true;
		}
		this._data.minColorTemperature = data?.color_temperature?.mirek_schema?.mirek_minimum ?? this._data.minColorTemperature;
		this._data.maxColorTemperature = data?.color_temperature?.mirek_schema?.mirek_maximum ?? this._data.maxColorTemperature;
		if (data?.color?.xy && (this._data.color?.x != data?.color?.xy?.x || this._data.color?.y != data?.color?.xy?.y))
		{
			this.emit("color", this._data.color = data.color.xy);
			color = true;
		}
		if (brightness || color)
			this.emit("real_color", {...this._data.color, brightness: (this._data.brightness ?? 0) / 100})
		this._data.colorGamut = data?.color?.gamut ?? this._data.colorGamut;
		if (data?.dynamics?.speed != undefined && this._data.dynamicSpeed != data?.dynamics?.speed)
			this.emit("dynamic_speed", this._data.dynamicSpeed = data.dynamics.speed);
		if (data?.dynamics?.status != undefined && this._data.dynamicStatus != data?.dynamics?.status)
			this.emit("dynamic_status", this._data.dynamicStatus = data.dynamics.status);
	}

	getName()
	{return (this._data.name)}

	/**
	 * Gets the list of capabilities
	 * 
	 * @returns {LightService.Capabilities[]} The list of capabilities
	 */
	getCapabilities()
	{return (this._capabilities)}

	/**
	 * Gets the state of light
	 * 
	 * @returns {LightService.State} The state of light
	 */
	getState()
	{return (this._data.state)}

	/**
	 * Set state of light
	 * 
	 * @param {LightService.State} state The state
	 * @returns {LightService|Promise} Return this object if prepareUpdate() was called, otherwise returns Promise
	 */
	setState(state, sender = this)
	{
		this._update.on = {on: state};
		if (this._prepareUpdate)
			return (sender);
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
	 * @returns {number} The brightness of light
	 */
	getBrightness()
	{
		return (Math.max(this._data.brightness ?? 100, this.getMinBrightness()))
	}

	/**
	 * Set brightness of light
	 * 
	 * @param {number} brightness The brightness
	 * @returns {LightService|Promise} Return this object if prepareUpdate() was called, otherwise returns Promise
	 */
	setBrightness(brightness, sender = this)
	{
		checkParam(this, "setBrightness", "brightness", brightness, "number");
		brightness = Math.max(brightness, this.getMinBrightness());
		if (brightness < 0 || brightness > 100)
			console.warn(`${this.constructor.name}.setBrightness(): Brightness '${brightness}' is out of range (0 <= value <= 100), sets to ${Math.min(Math.max(value, 0), 100)}`);
		this._update.dimming = {brightness};
		if (this._prepareUpdate)
			return (sender);
		return (this.update());
	}

	/**
	 * Gets the color temperature of light
	 * 
	 * @param {Serviceight.ColorTemperatureUnit} [unit=LightService.ColorTemperatureUnit.MIRED] The color temperature unit, default to LightService.ColorTemperatureUnit.MIRED
	 * @returns {number|{r: number, g: number, b: number}} Returns the color temperture in unit defined in parameter
	 * @throws {ArgumentError}
	 */
	getColorTemperature(unit = LightService.ColorTemperatureUnit.MIRED)
	{
		checkParam(this, "getColorTemperature", "unit", unit, LightService.ColorTemperatureUnit, "LightService.ColorTemperatureUnit");
		if (unit == LightService.ColorTemperatureUnit.MIRED)
			return (this._data.colorTemperature);
		if (unit == LightService.ColorTemperatureUnit.KELVIN)
			return (Mired.miredToKelvin(this._data.colorTemperature));
		if (unit == LightService.ColorTemperatureUnit.RGB)
			return (Mired.miredToRGB(this._data.colorTemperature));
	}

	/**
	 * Sets the color temperature of light
	 * 
	 * @param {number|{r: number, g: number, b: number}} value the color temperture in unit defined in parameter
	 * @param {LightService.ColorTemperatureUnit} [unit=LightService.ColorTemperatureUnit.MIRED] The color temperature unit, default to LightService.ColorTemperatureUnit.MIRED
	 * @returns {LightService|Promise} Return this object if prepareUpdate() was called, otherwise returns Promise
	 * @throws {ArgumentError}
	 */
	setColorTemperature(value, unit = LightService.ColorTemperatureUnit.MIRED, sender = this)
	{
		checkParam(this, "setColorTemperature", "value", value, "number");
		checkParam(this, "setColorTemperature", "unit", unit, LightService.ColorTemperatureUnit, "LightService.ColorTemperatureUnit");
		if (unit == LightService.ColorTemperatureUnit.KELVIN)
			value = Mired.kelvinToMired(value);
		else if (unit == LightService.ColorTemperatureUnit.RGB)
			value = Mired.RGBToMired(value);
		this._update.color_temperature = {mirek: value};
		if (this._prepareUpdate)
			return (sender);
		return (this.update());
	}

	/**
	 * Gets the color temperature of light
	 * 
	 * @param {Serviceight.ColorUnit} [unit=LightService.ColorUnit.RGB] The colorunit, default to LightService.ColorUnit.RGB
	 * @returns {number|{r: number, g: number, b: number}} Returns the color in unit defined in parameter
	 * @throws {ArgumentError}
	 */
	getColor(unit)
	{
		checkParam(this, "getColor", "unit", unit, LightService.ColorUnit, "LightService.ColorUnit");
		if (unit == LightService.ColorUnit.RGB)
			return (Color.xyBriToRgb(this._data.color.x, this._data.color.y, 1));
		if (unit == LightService.ColorUnit.HEX)
			return (Color.xyBriToHex(this._data.color.x, this._data.color.y, 1));
		if (unit == LightService.ColorUnit.XY)
			return (this._data.color);
	}

	/**
	 * Gets the real color of the light, this color is defined thanks to the defined color as well as the brightness
	 * 
	 * @param {Serviceight.ColorUnit} [unit=LightService.ColorUnit.RGB] The colorunit, default to LightService.ColorUnit.RGB
	 * @returns {number|{r: number, g: number, b: number}} Returns the color in unit defined in parameter
	 * @throws {ArgumentError}
	 */
	getRealColor(unit = LightService.ColorUnit.RGB)
	{
		checkParam(this, "getRealColor", "unit", unit, LightService.ColorUnit, "LightService.ColorUnit");
		if (unit == LightService.ColorUnit.RGB)
			return (Color.xyBriToRgb(this._data.color.x, this._data.color.y, (this._data.brightness ?? 0) / 100));
		if (unit == LightService.ColorUnit.HEX)
			return (Color.xyBriToHex(this._data.color.x, this._data.color.y, (this._data.brightness ?? 0) / 100));
		if (unit == LightService.ColorUnit.XY)
			return ({...this._data.color, brightness: (this._data.brightness ?? 0) / 100});
	}

	/**
	 * Sets the color of light
	 * 
	 * @param {number|{r: number, g: number, b: number}} value the color temperture in unit defined in parameter
	 * @param {Serviceight.ColorUnit} [unit=LightService.ColorUnit.RGB] The color unit, default to LightService.ColorUnit.RGB
	 * @returns {LightService|Promise} Return this object if prepareUpdate() was called, otherwise returns Promise
	 * @throws {ArgumentError}
	 */
	setColor(value, unit, sender = this)
	{
		checkParam(this, "setColor", "value", value, "number");
		checkParam(this, "setColor", "unit", unit, LightService.ColorUnit, "LightService.ColorUnit");
		if (unit == LightService.ColorUnit.RGB)
			value = Color.rgbToXy(value.r, value.g, value.b, this._data.colorGamut);
		this._update.color = {xy: {x: value.x, y: value.y}};
		if (this._prepareUpdate)
			return (sender);
		return (this.update());
	}

	/**
	 * Sets the color of light
	 * 
	 * @param {number|{r: number, g: number, b: number}} value the color temperture in unit defined in parameter
	 * @param {Serviceight.ColorUnit} [unit=LightService.ColorUnit.RGB] The color unit, default to LightService.ColorUnit.RGB
	 * @returns {LightService|Promise} Return this object if prepareUpdate() was called, otherwise returns Promise
	 * @throws {ArgumentError}
	 */
	setRealColor(value, unit, sender = this)
	{
		checkParam(this, "setColor", "value", value, "number");
		checkParam(this, "setColor", "unit", unit, LightService.ColorUnit, "LightService.ColorUnit");
		if (unit == LightService.ColorUnit.RGB)
			value = Color.rgbToXy(value.r, value.g, value.b, this._data.colorGamut);
		this._update.color = {xy: {x: value.x, y: value.y}};
		this._update.dimming = {brightness: value.brightness * 100};
		if (this._prepareUpdate)
			return (sender);
		return (this.update());
	}

	/**
	 * Gets the dynamic scene speed
	 * 
	 * @returns {number} The speed of dynamic scene, between 0 and 100
	 */
	getDynamicSpeed()
	{return (this._data.dynamicSpeed * 100)}

	/**
	 * Sets the dynamic scene speed
	 * 
	 * @param {number} speed The speed value between 0 and 100
	 * @returns {LightService|Promise} Return this object if prepareUpdate() was called, otherwise returns Promise
	 * @throws {ArgumentError}
	 */
	setDynamicSpeed(speed, sender = this)
	{
		checkParam(this, "setDynamicSpeed", "speed", speed, "number");
		if (speed < 0 || speed > 100)
			console.warn(`${this.constructor.name}.setDynamicSpeed(): Speed '${speed}' is out of range (0 <= value <= 100), sets to ${Math.min(Math.max(value, 0), 100)}`);
		speed = Math.min(Math.max(speed, 0), 100);
		this._update.dynamics ??= {};
		this._update.dynamics.speed = speed / 100;
		if (this._prepareUpdate)
			return (sender);
		return (this.update());
	}

	/**
	 * Gets the dynamic scene status
	 * 
	 * @returns {LightService.DynamicStatus} The dynamic scene status
	 */
	getDynamicStatus()
	{return (this._data.dynamicStatus)}
	 
	/**
	 * Sets the transition time of update
	 * 
	 * @param {number} duration The duration value between 0 and 6000000, duration in ms
	 * @returns {LightService|Promise} Return this object if prepareUpdate() was called, otherwise returns Promise
	 * @throws {ArgumentError}
	 */
	setTransitionTime(duration, sender = this)
	{
		checkParam(this, "setTransitionTime", "duration", duration, "number");
		if (duration < 0 || duration > 6000000)
			console.warn(`${this.constructor.name}.setTransitionTime(): Duration '${duration}' is out of range (0 <= value <= 6000000), sets to ${Math.min(Math.max(value, 0), 6000000)}`);
		duration = Math.min(Math.max(duration, 0), 6000000);
		this._update.dynamics ??= {};
		this._update.dynamics.duration = duration;
		if (this._prepareUpdate)
			return (sender);
		return (this.update());
	}

	/**
	 * Sets the alert type to the light
	 * 
	 * @param {LightService.AlertType} type The type of alert
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
		if (this._prepareUpdate)
			return (sender);
		return (this.update());
	}

	/**
	 * Gets the current mode of the light
	 * 
	 * @returns {LightService.Mode} The mode
	 */
	getMode()
	{return (this._data.mode)}
}
