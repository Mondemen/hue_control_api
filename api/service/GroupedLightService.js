import { checkParam } from "../../utils/index.js";
import LightService from "./LightService.js";
import Service from "./Service.js";

export default class GroupedLightService extends Service
{
	static State = LightService.State;
	static ColorTemperatureUnit = LightService.ColorTemperatureUnit;
	static ColorUnit = LightService.ColorUnit;
	static AlertType = LightService.AlertType;

	constructor(bridge, data)
	{
		super(bridge, data);
	}

	_setData(data, update = false)
	{
		super._setData(data, update);
		if (data?.on?.on != undefined && this._data.state != data?.on?.on)
		{
			this._data.state = data.on.on;
			this.emit("state", this._data.state);
		}
	}

	/**
	 * Gets the state of light
	 * 
	 * @returns {GroupedLightService.State} The state of light
	 */
	getState()
	{return (this._data.state)}

	/**
	 * Set state of light
	 * 
	 * @param {GroupedLightService.State} state The state
	 * @returns {GroupedLightService|Promise} Return this object if prepareUpdate() was called, otherwise returns Promise
	 */
	setState(state, sender = this)
	{
		this._update.on = {on: state};
		if (this._prepareUpdate)
			return (sender);
		return (this.update());
	}

	/**
	 * Gets the brightness of grouped light
	 * 
	 * @returns {number} The brightness of grouped light
	 */
	getBrightness()
	{return (this._data.brightness)}

	/**
	 * Set brightness of grouped light
	 * 
	 * @param {number} brightness The brightness
	 * @returns {LightService|Promise} Return this object if prepareUpdate() was called, otherwise returns Promise
	 */
	setBrightness(brightness, sender = this)
	{
		checkParam(this, "setBrightness", "brightness", brightness, "number");
		if (brightness < 0 || brightness > 100)
			console.warn(`${this.constructor.name}.setBrightness(): Brightness '${brightness}' is out of range (0 <= value <= 100), sets to ${Math.min(Math.max(value, 0), 100)}`);
		this._updateV1.action ??= {};
		this._updateV1.action.bri = Math.round(brightness / 100 * 254);
		if (this._prepareUpdate)
			return (sender);
		return (this.update());
	}

	/**
	 * Sets the color temperature of grouped light
	 * 
	 * @param {number|{r: number, g: number, b: number}} value the color temperture in unit defined in parameter
	 * @param {GroupedLightService.ColorTemperatureUnit} [unit=GroupedLightService.ColorTemperatureUnit.MIRED] The color temperature unit, default to GroupedLightService.ColorTemperatureUnit.MIRED
	 * @returns {GroupedLightService|Promise} Return this object if prepareUpdate() was called, otherwise returns Promise
	 * @throws {ArgumentError}
	 */
	setColorTemperature(value, unit = GroupedLightService.ColorTemperatureUnit.MIRED, sender = this)
	{
		checkParam(this, "setColorTemperature", "value", value, Number);
		checkParam(this, "setColorTemperature", "unit", unit, GroupedLightService.ColorTemperatureUnit, "GroupedLightService.ColorTemperatureUnit");
		if (unit == GroupedLightService.ColorTemperatureUnit.KELVIN)
			value = Mired.kelvinToMired(value);
		else if (unit == GroupedLightService.ColorTemperatureUnit.RGB)
			value = Mired.RGBToMired(value);
		this._updateV1.action ??= {};
		this._updateV1.action.ct = value;
		if (this._prepareUpdate)
			return (sender);
		return (this.update());
	}

	/**
	 * Sets the color of grouped light
	 * 
	 * @param {number|{r: number, g: number, b: number}} value the color temperture in unit defined in parameter
	 * @param {Serviceight.ColorUnit} [unit=LightService.ColorUnit.RGB] The color unit, default to LightService.ColorUnit.RGB
	 * @returns {LightService|Promise} Return this object if prepareUpdate() was called, otherwise returns Promise
	 * @throws {ArgumentError}
	 */
	setColor(value, unit, sender = this)
	{
		checkParam(this, "setColor", "value", value, Number);
		checkParam(this, "setColor", "unit", unit, LightService.ColorUnit, "LightService.ColorUnit");
		if (unit == LightService.ColorUnit.RGB)
			value = Color.rgbToXy(value.r, value.g, value.b, this._data.colorGamut);
		this._updateV1.action ??= {};
		this._updateV1.action.xy = [value.x, value.y];
		if (this._prepareUpdate)
			return (sender);
		return (this.update());
	}

	/**
	 * Sets the color of grouped light
	 * 
	 * @param {number|{r: number, g: number, b: number}} value the color temperture in unit defined in parameter
	 * @param {Serviceight.ColorUnit} [unit=LightService.ColorUnit.RGB] The color unit, default to LightService.ColorUnit.RGB
	 * @returns {LightService|Promise} Return this object if prepareUpdate() was called, otherwise returns Promise
	 * @throws {ArgumentError}
	 */
	setRealColor(value, unit, sender = this)
	{
		checkParam(this, "setColor", "value", value, Number);
		checkParam(this, "setColor", "unit", unit, LightService.ColorUnit, "LightService.ColorUnit");
		if (unit == LightService.ColorUnit.RGB)
			value = Color.rgbToXy(value.r, value.g, value.b, this._data.colorGamut);
		this._updateV1.action ??= {};
		this._updateV1.action.xy = [value.x, value.y];
		this._updateV1.action.bri = value.brightness * 255;
		if (this._prepareUpdate)
			return (sender);
		return (this.update());
	}

	/**
	 * Sets the alert type to the grouped light
	 * 
	 * @param {GroupedLightService.AlertType} type The type of alert
	 * @returns {GroupedLightService|Promise} Return this object if prepareUpdate() was called, otherwise returns Promise
	 * @throws {ArgumentError}
	 */
	setAlert(type, sender = this)
	{
		checkParam(this, "setAlert", "unit", unit, GroupedLightService.AlertType, "GroupedLightService.AlertType");
		this._updateV1.action ??= {};
		this._updateV1.action.action = (type == GroupedLightService.AlertType.BREATHE) ? "lselect" : type;
		if (this._prepareUpdate)
			return (sender);
		return (this.update());
	}
}
