import Color from "../../lib/Color.js";
import LightData from "../../lib/LightData.js";
import Mired from "../../lib/Mired.js";
import { checkParam } from "../../utils/index.js";
import LightService from "./LightService.js";
import Service from "./Service.js";

/** @typedef {import("./LightService.js").ColorValue} ColorValue */

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
			this.emit("state", this._data.state = data.on.on);
		if (data?.dimming?.brightness != undefined && this._data.brightness != data?.dimming?.brightness)
			this.emit("brightness", this._data.brightness = data.dimming.brightness);
	}

	_getFullData()
	{
		return (
		{
			...super._getFullData(),
			state: this._data.state,
			brightness: this._data.brightness,
		})
	}

	/**
	 * Gets the state of light
	 *
	 * @returns {GroupedLightService.State[keyof typeof GroupedLightService.State]} The state of light
	 */
	getState()
	{return (this._data.state)}

	/**
	 * Set state of light
	 *
	 * @param {GroupedLightService.State[keyof typeof GroupedLightService.State]} state The state
	 * @returns {GroupedLightService|Promise} Return this object if prepareUpdate() was called, otherwise returns Promise
	 */
	setState(state, sender = this)
	{
		this._update.on = {on: state};
		if (sender._prepareUpdate)
		{
			sender._updatedService[this.getID()] = this;
			return (sender);
		}
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
	 * @returns {GroupedLightService|Promise} Return this object if prepareUpdate() was called, otherwise returns Promise
	 */
	setBrightness(brightness, sender = this)
	{
		checkParam(this, "setBrightness", "brightness", brightness, "number");
		if (0 > brightness || brightness > 100)
			console.warn(`${sender.constructor.name}.setBrightness(): Brightness '${brightness}' is out of range (0 <= value <= 100), sets to ${Math.min(Math.max(brightness, 0), 100)}`);
		this._update.dimming ??= {};
		this._update.dimming.brightness = brightness;
		if (sender._prepareUpdate)
		{
			sender._updatedService[this.getID()] = this;
			return (sender);
		}
		return (this.update());
	}

	/**
	 * Sets the color temperature of grouped light
	 *
	 * @param {Mired|Color|ColorValue|number} value The color temperature
	 * @returns {GroupedLightService|Promise} Return this object if prepareUpdate() was called, otherwise returns Promise
	 * @throws {ArgumentError}
	 */
	setColorTemperature(value, sender = this)
	{
		checkParam(this, "setColorTemperature", "value", value, [Mired, Color, "number", "string", "object"]);
		LightData.setColorTemperature(this._update, value);
		// this._updateV1.action ??= {};
		// this._updateV1.action.ct = new Mired(value).mirek();
		if (sender._prepareUpdate)
		{
			sender._updatedService[this.getID()] = this;
			return (sender);
		}
		return (this.update());
	}

	/**
	 * Sets the color of grouped light
	 *
	 * @param {Color|ColorValue} value The color
	 * @returns {GroupedLightService|Promise} Return this object if prepareUpdate() was called, otherwise returns Promise
	 * @throws {ArgumentError}
	 */
	setColor(value, sender = this)
	{
		checkParam(this, "setColor", "value", value, [Color, "string", "object"]);
		LightData.setColor(this._update, value);
		if (sender._prepareUpdate)
		{
			sender._updatedService[this.getID()] = this;
			return (sender);
		}
		return (this.update());
	}

	/**
	 * Sets the alert type to the grouped light
	 *
	 * @param {GroupedLightService.AlertType[keyof typeof GroupedLightService.AlertType]} type The type of alert
	 * @returns {GroupedLightService|Promise} Return this object if prepareUpdate() was called, otherwise returns Promise
	 * @throws {ArgumentError}
	 */
	setAlert(type, sender = this)
	{
		checkParam(this, "setAlert", "unit", unit, GroupedLightService.AlertType, "GroupedLightService.AlertType");
		this._updateV1.action ??= {};
		this._updateV1.action.action = (type == GroupedLightService.AlertType.BREATHE) ? "lselect" : type;
		if (sender._prepareUpdate)
		{
			sender._updatedService[this.getID()] = this;
			return (sender);
		}
		return (this.update());
	}
}
