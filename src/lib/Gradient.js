import Resource from "../api/Resource.js";
import { checkParam } from "../utils/index.js";
import Color from "./Color.js";
import ExtError from "./error/ExtError.js";
import LightData from "./LightData.js";

/**
 * @typedef {import("../api/light/ColorBulb.js").default} ColorBulb
 * @typedef {import("../api/light/WhiteAndColorBulb.js").default} WhiteAndColorBulb
 * @typedef {import('../api/Scene.js').default} Scene
 * @typedef {import("./Color.js").ColorValue} ColorValue
 * @typedef {import("./Color.js").XYValue} XYValue
 *
 * @callback GradientColorEvent
 * @param {number} i - Index position of color in array
 * @param {Color} color - The color
 *
 * @callback GradientColorXYEvent
 * @param {number} i - Index position of color in array
 * @param {XYValue} color - The color in XY format
 *
 * @callback GradientModeEvent
 * @param {Gradient.Mode[keyof typeof Gradient.Mode]} mode - The mode
 */

export default class Gradient
{
	/**
	 * The gradient mode
	 *
	 * @readonly
	 * @enum {string}
	 */
	static Mode =
	{
		INTERPOLATED_PALETTE: "interpolated_palette",
		INTERPOLATED_PALETTE_MIRRORED: "interpolated_palette_mirrored",
		RANDOM_PIXELATED: "random_pixelated"
	}

	/**
	 * @type {Resource}
	 * @private
	 */
	_parent;
	/** @private */
	_data = {};
	/** @private */
	_update = {};

	constructor(parent, eventSource)
	{
		this._parent = parent;
		this._eventSource = eventSource;
	}

	/**
	 * @private
	 */
	_setData(data)
	{
		data?.points?.forEach((point, i) =>
		{
			this._data.points[i] ??= {};
			if (point?.color?.xy && (this._data.points[i].color?.xy?.x != point?.color?.xy?.x || this._data.points[i].color?.xy?.y != point?.color?.xy?.y))
			{
				LightData.setColor(this._data.points[i], point.color.xy);
				this.emit("color", i, new Color(point.color.xy));
				this.emit("color_xy", i, point.color.xy);
			}
		});
		if (data?.mode && data.mode != this._data.mode)
			this.emit("mode", this._data.mode = data.mode);
		if (data?.points_capable != undefined && data.points_capable != this._data.points_capable)
			this._data.points_capable = data.points_capable;
		if (data?.pixel_count != undefined && data.pixel_count != this._data.pixel_count)
			this._data.pixel_count = data.pixel_count;
	}

	/**
	 * @private
	 */
	_getData()
	{
		let data = (this._parent.isExists()) ? this._update : this._data;

		if (data)
			return ({gradient: data});
	}

	emit(eventName, ...args)
	{this._eventSource.emit(`gradient_${eventName}`, ...args)}

	/**
	 * Sets color and brightness at the index
	 *
	 * @param {number} index - The index of color, between 0 and 8
	 * @param {Color|ColorValue} color - The color
	 * @returns {Palette}
	 * @throws {ArgumentError}
	 */
	setColor(index, color)
	{
		let data = {};

		if (index < 0 || index > 4)
			throw new ExtError(`The index must have between 0 and 4`);
		checkParam(this, "setColor", "color", color, [Color, "string", "object"]);
		if (this._parent.isExists())
		{
			this._update.points ??= [];
			this._update.points[index] ??= {};
			LightData.setColor(this._update.points[index], color);
			if (this._sender)
			{
				if (!this._sender._prepareUpdate)
					return (this._sender.update());
				else
					this._sender._updatedService[this._parent.getID()] = this._parent;
			}
		}
		else
		{
			this._data.points ??= [];
			this._data.points[index] ??= {};
			LightData.setColor(this._data.points[index], color);
		}
		return (this);
	}

	/**
	 * Add color
	 *
	 * @param {Color|ColorValue} color - The color
	 * @returns {Gradient}
	 * @throws {ArgumentError}
	 */
	addColor(color)
	{
		let data = {};

		if (this._data.length >= 5)
			throw new ExtError(`The maximum number of point in gradient is 5`);
		checkParam(this, "addColor", "color", color, [Color, "string", "object"]);
		LightData.setColor(data, color);
		if (this._parent.isExists())
		{
			this._update.points ??= [];
			this._update.points.push(data);
			if (this._sender)
			{
				if (!this._sender._prepareUpdate)
					return (this._sender.update());
				else
					this._sender._updatedService[this._parent.getID()] = this._parent;
			}
		}
		else
		{
			this._data.points ??= [];
			this._data.points.push(data);
		}
		return (this);
	}

	/**
	 * Gets color from index
	 *
	 * @returns {Color}
	 */
	getColor(index)
	{
		if (this._update.points?.[index]?.color?.xy || this._data.points?.[index]?.color?.xy)
			return (new Color(this._update.points[index]?.color?.xy ?? this._data.points[index]?.color?.xy))
	}

	/**
	 * Gets color from index in XY format
	 *
	 * @returns {XYValue}
	 */
	getColorXY(index)
	{return (this._update.points[index]?.color?.xy ?? this._data.points[index]?.color?.xy);}

	/**
	 * Gets the list of color
	 *
	 * @returns {Color[]}
	 */
	getColors()
	{return ((this._update.points ?? this._data.points ?? []).map(point => new Color(point.color.xy)))}

	/**
	 * Gets the list of color in XY format
	 *
	 * @returns {XYValue[]}
	 */
	getColorsXY()
	{return ((this._update.points ?? this._data.points ?? []).map(point => point.color.xy))}

	/**
	 * Remove color
	 *
	 * @param {number} index - The index of color, between 0 and 4
	 * @returns {Gradient}
	 * @throws {ArgumentError}
	 */
	removeColor(index)
	{
		if (index < 0 || index > 4)
			throw new ExtError(`The index must have between 0 and 4`);
		if (this._parent.isExists())
		{
			this._update.points ??= [];
			this._update.points[index] = undefined;
			if (this._sender)
			{
				if (!this._sender._prepareUpdate)
					return (this._sender.update());
				else
					this._sender._updatedService[this._parent.getID()] = this._parent;
			}
		}
		else
		{
			this._data.points ??= [];
			this._data.points[index] = undefined;
		}
		return (this);
	}

	/**
	 * Set mode in which the points are currently being deployed
	 *
	 * @param {Gradient.Mode[keyof typeof Gradient.Mode]} mode - The mode
	 * @throws {ArgumentError}
	 */
	setMode(mode)
	{
		checkParam(this, "setMode", "mode", mode, Gradient.Mode, "Gradient.Mode");
		if (this._parent.isExists())
		{
			this._update.mode = mode;
			if (this._sender)
			{
				if (!this._sender._prepareUpdate)
					return (this._sender.update());
				else
					this._sender._updatedService[this._parent.getID()] = this._parent;
			}
		}
		else
			this._data.mode = mode;
		return (this);
	}

	/**
	 * Get mode in which the points are currently being deployed
	 *
	 * @returns {Gradient.Mode[keyof typeof Gradient.Mode]}
	 */
	getMode()
	{return (this._update.mode ?? this._data.mode ?? Gradient.Mode.INTERPOLATED_PALETTE)}

	/**
	 * Get the number of color points that gradient is capable of showing with gradience
	 *
	 * @returns {number}
	 */
	getPointsCapable()
	{return (this._data.points_capable)}

	/**
	 * Get the number of pixels in the device
	 *
	 * @returns {number}
	 */
	getPixelCount()
	{return (this._data.pixel_count)}
}
