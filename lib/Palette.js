import { checkParam } from "../utils/index.js";
import Color from "./Color.js";
import LightData from "./LightData.js";
import Mired from "./Mired.js";

/**
 * @typedef {import('../api/Scene.js').default} Scene
 * @typedef {import("./Color.js").ColorValue} ColorValue
 */

export default class Palette
{
	/**
	 * @type {Scene}
	 * @private
	 */
	_scene;
	/** @private */
	_data = {};
	/** @private */
	_update = {};

	constructor(scene)
	{
		this._scene = scene;
	}

	/**
	 * @private
	 */
	_initPalette()
	{
		this._data.palette ??= {};
		this._data.palette.color ??= [];
		this._data.palette.color_temperature ??= [];
		this._data.palette.dimming ??= [];
		this._data.speed ??= 0.5;
	}

	/**
	 * @private
	 */
	_copyToUpdate()
	{
		if (!this._update.palette)
		{
			this._update.palette = {};
			this._update.palette.color = [];
			this._update.palette.color_temperature = [];
			this._update.palette.dimming = [];
			this._data.palette.color.forEach((color, i) =>
			{
				this._update.palette.color[i] ??= {};
				LightData.setColor(this._update.palette.color[i], {...color.color.xy});
				LightData.setBrightness(this._update.palette.color[i], color.dimming.brightness);
			});
			this._data.palette.color_temperature.forEach((colorTemperature, i) =>
			{
				this._update.palette.color_temperature[i] ??= {};
				LightData.setColorTemperature(this._update.palette.color_temperature[i], colorTemperature.color_temperature.mirek);
				LightData.setBrightness(this._update.palette.color_temperature[i], colorTemperature.dimming.brightness);
			});
			this._data.palette.dimming.forEach((dimming, i) =>
			{
				this._update.palette.dimming[i] ??= {};
				LightData.setBrightness(this._update.palette.dimming[i], dimming.brightness);
			});
		}
	}

	/**
	 * @private
	 */
	_setData(data)
	{
		let emit;
		let emitPalette = false;

		if (data?.palette?.color || data?.palette?.color_temperature || data?.palette?.dimming)
		{
			this._initPalette();
			data?.palette?.color?.forEach((color, i) =>
			{
				emit = {};
				this._data.palette.color[i] ??= {};
				if (color?.color?.xy && (this._data.palette.color[i].color?.xy?.x != color?.color?.xy?.x || this._data.palette.color[i].color?.xy?.y != color?.color?.xy?.y))
				{
					LightData.setColor(this._data.palette.color[i], color.color.xy);
					emit["color"] = emitPalette = true;
				}
				if (color?.dimming?.brightness != undefined && this._data.palette.color[i]?.dimming?.brightness != color.dimming.brightness)
				{
					LightData.setBrightness(this._data.palette.color[i], color.dimming.brightness);
					emit["color_brightness"] = emitPalette = true;
				}
				if (emit["color"])
					this._scene.emit("palette_color", i, new Color(color.color.xy));
				if (emit["color_brightness"])
					this._scene.emit("palette_color_brightness", i, color.dimming.brightness);
			});
			data?.palette?.color_temperature?.forEach((color_temp, i) =>
			{
				emit = {};
				this._data.palette.color_temperature[i] ??= {};
				if (color_temp?.color_temperature?.mirek != undefined && this._data.palette.color_temperature[i]?.color_temperature?.mirek != color_temp?.color_temperature?.mirek)
				{
					LightData.setColorTemperature(this._data.palette.color_temperature[i], color_temp.color_temperature.mirek);
					emit["color_temperature"] = emitPalette = true;
				}
				if (color_temp?.dimming?.brightness != undefined && this._data.palette.color_temperature[i]?.dimming?.brightness != color_temp.dimming.brightness)
				{
					LightData.setBrightness(this._data.palette.color_temperature[i], color_temp.dimming.brightness);
					emit["color_temperature_brightness"] = emitPalette = true;
				}
				if (emit["color_temperature"])
					this._scene.emit("palette_color_temperature", i, new Mired(color_temp.color_temperature.mirek));
				if (emit["color_temperature_brightness"])
					this._scene.emit("palette_color_temperature_brightness", i, color_temp.dimming.brightness);
			});
			data?.palette?.dimming?.forEach((dimming, i) =>
			{
				this._data.palette.dimming[i] ??= {};
				if (dimming?.brightness != undefined && this._data.palette.dimming[i]?.brightness != dimming.brightness)
				{
					emitPalette = true;
					this._data.palette.dimming[i].brightness = dimming.brightness;
					this._scene.emit("palette_brightness", i, dimming.brightness);
				}
			});
		}
		if (emitPalette)
			this._scene.emit("palette");
		if (data?.speed != undefined && data.speed != this._data.speed)
		{
			this._data.speed = data.speed;
			this._scene.emit("speed", this._data.speed)
		}
	}

	/**
	 * @private
	 */
	_getData()
	{
		let result = {};
		let data = (this._scene.isExists()) ? this._update : this._data;

		if (data.palette != undefined)
		{
			result.palette ??= {};
			result.palette.color = data.palette.color.filter(color => color);
			result.palette.color_temperature = data.palette.color_temperature.filter(color_temperature => color_temperature);
			result.palette.dimming = data.palette.dimming.filter(dimming => dimming);
		}
		if (data.speed != undefined)
			result.speed = data.speed;
		return (result);
	}

	isDynamic()
	{return (this._data?.palette?.color?.length > 1)}

	/**
	 * Sets color and brightness at the index
	 *
	 * @param {number} index - The index of color, between 0 and 8
	 * @param {Color|ColorValue} color - The color
	 * @param {number} brightness - The brightness
	 * @returns {Palette}
	 * @throws {ArgumentError}
	 */
	setColor(index, color, brightness)
	{
		if (index < 0 || index > 8)
			throw new Error(`The index must have between 0 and 8`);
		checkParam(this, "setColor", "color", color, [Color, "string", "object"]);
		checkParam(this, "setColor", "brightness", brightness, "number");
		if (this._scene.isExists())
		{
			this._copyToUpdate();
			this._update.palette.color[index] ??= {};
			LightData.setColor(this._update.palette.color[index], color);
			LightData.setBrightness(this._update.palette.color[index], brightness);
			if (!this._scene._prepareUpdate)
				return (this._scene.update());
		}
		else
		{
			this._initPalette();
			LightData.setColor(this._data.palette.color[index], color);
			LightData.setBrightness(this._data.palette.color[index], brightness);
		}
		return (this);
	}

	/**
	 * Add color and brightness
	 *
	 * @param {Color|ColorValue} color - The color
	 * @param {number} brightness - The brightness
	 * @returns {Palette}
	 * @throws {ArgumentError}
	 */
	addColor(color, brightness = 100)
	{
		let data = {};

		if (this._data.palette?.color?.length >= 9)
			throw new Error(`The maximum number of color in palette is 9`);
		checkParam(this, "addColor", "color", color, [Color, "string", "object"]);
		checkParam(this, "addColor", "brightness", brightness, "number");
		if (this._scene.isExists())
		{
			this._copyToUpdate();
			LightData.setColor(data, color);
			LightData.setBrightness(data, brightness);
			this._update.palette.color.push(data);
			if (!this._scene._prepareUpdate)
				return (this._scene.update());
		}
		else
		{
			this._initPalette();
			LightData.setColor(data, color);
			LightData.setBrightness(data, brightness);
			this._data.palette.color.push(data);
		}
		return (this);
	}

	/**
	 * Gets color from index
	 *
	 * @returns {{color: {xy: {x: number, y: number}}, dimming: {brightness: number}}}
	 */
	getColor(index)
	{return (this._update?.palette?.color[index] ?? this._data?.palette?.color[index])}

	/**
	 * Gets the list of color
	 *
	 * @returns {{color: {xy: {x: number, y: number}}, dimming: {brightness: number}}[]}
	 */
	getColors()
	{return (this._update?.palette?.color ?? this._data?.palette?.color ?? [])}

	/**
	 * Remove color and brightness
	 *
	 * @param {number} index - The index of color, between 0 and 8
	 * @returns {Palette}
	 * @throws {ArgumentError}
	 */
	removeColor(index)
	{
		if (index < 0 || index > 8)
			throw new Error(`The index must have between 0 and 8`);
		if (this._scene.isExists())
		{
			this._copyToUpdate();
			this._update.palette.color[index] = undefined;
			if (!this._scene._prepareUpdate)
				return (this._scene.update());
		}
		else
		{
			this._initPalette();
			this._data.palette.color[index] = undefined;
		}
		return (this);
	}

	/**
	 * Sets color temperature and brightness
	 *
	 * @param {Mired|Color|ColorValue|number} mired - The color temperature
	 * @param {number} brightness - The brightness
	 * @returns {Palette}
	 * @throws {ArgumentError}
	 */
	setColorTemperature(mired, brightness = 100)
	{
		checkParam(this, "setColorTemperature", "mired", mired, [Mired, "string", "object"]);
		checkParam(this, "setColorTemperature", "brightness", brightness, "number");
		if (this._scene.isExists())
		{
			this._copyToUpdate();
			this._update.palette.color_temperature[0] ??= {};
			LightData.setColorTemperature(this._update.palette.color_temperature[0], mired);
			LightData.setBrightness(this._update.palette.color_temperature[0], brightness);
			if (!this._scene._prepareUpdate)
				return (this._scene.update());
		}
		else
		{
			this._initPalette();
			this._data.palette.color_temperature[0] ??= {};
			LightData.setColorTemperature(this._data.palette.color_temperature[0], mired);
			LightData.setBrightness(this._data.palette.color_temperature[0], brightness);
		}
		return (this);
	}

	/**
	 * Gets color temperature and brightness
	 *
	 * @returns {{color_temperature: {mired: number}, dimming: {brightness: number}}}
	 */
	getColorTemperature()
	{return (this._update?.palette?.color_temperature?.[0] ?? this._data?.palette?.color_temperature?.[0])}

	/**
	 * Remove color temperature and brightness
	 *
	 * @returns {Palette}
	 */
	removeColorTemperature()
	{
		if (this._scene.isExists())
		{
			this._copyToUpdate();
			this._update.palette.color_temperature[0] = undefined;
			if (!this._scene._prepareUpdate)
				return (this._scene.update());
		}
		else
		{
			this._initPalette();
			this._data.palette.color_temperature[0] = undefined;
		}
		return (this);
	}

	/**
	 * Sets brightness
	 *
	 * @param {number} brightness - The brightness
	 * @returns {Palette}
	 * @throws {ArgumentError}
	 */
	setBrightness(brightness)
	{
		checkParam(this, "setBrightness", "brightness", brightness, "number");
		if (this._scene.isExists())
		{
			this._copyToUpdate();
			this._update.palette.dimming[0] ??= {};
			LightData.setBrightness(this._update.palette.dimming[0], brightness);
			if (!this._scene._prepareUpdate)
				return (this._scene.update());
		}
		else
		{
			this._initPalette();
			this._data.palette.dimming[0] ??= {};
			LightData.setBrightness(this._data.palette.dimming[0], brightness);
		}
		return (this);
	}

	/**
	 * Gets brightness
	 *
	 * @returns {{brightness: number}}
	 */
	getBrightness()
	{return (this._update?.palette?.dimming?.[0] ?? this._data?.palette?.dimming?.[0])}

	/**
	 * Remove brightness
	 *
	 * @returns {Palette}
	 */
	removeBrightness()
	{
		if (this._scene.isExists())
		{
			this._copyToUpdate();
			this._update.palette.dimming[0] = undefined;
			if (!this._scene._prepareUpdate)
				return (this._scene.update());
		}
		else
		{
			this._initPalette();
			this._data.palette.dimming[0] = undefined;
		}
		return (this);
	}

	/**
	 * Sets the speed of the dynamic palette
	 *
	 * @param {number} speed - The speed
	 * @returns {Palette}
	 */
	setSpeed(speed)
	{
		if (speed < 0 || speed > 1)
			console.warn(`${this._scene.constructor.name}.setDynamicSpeed(): Speed '${speed}' is out of range (0 <= value <= 1), sets to ${Math.min(Math.max(value, 0), 1)}`);
		speed = Math.min(Math.max(speed, 0), 1);
		if (this._scene.isExists())
		{
			this._copyToUpdate();
			this._update.speed = speed;
			if (!this._scene._prepareUpdate)
				return (this._scene.update());
		}
		else
		{
			this._initPalette();
			this._data.speed = speed;
		}
		return (this);
	}

	/**
	 * Gets speed of the dynamic palette
	 *
	 * @returns {number}
	 */
	getSpeed()
	{return (this._update?.speed ?? this._data?.speed)}
}
