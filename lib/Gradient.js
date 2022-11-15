import Resource from "../api/Resource.js";
import { checkParam } from "../utils/index.js";
import Color from "./Color.js";
import LightData from "./LightData.js";

/**
 * @typedef {import('../api/Scene.js').default} Scene
 * @typedef {import("./Color.js").ColorValue} ColorValue
 */

export default class Gradient
{
	/** @type {Resource} */
	_parent;
	_data = [];
	_update = [];

	constructor(parent)
	{
		this._parent = parent;
	}

	_setData(data)
	{
		data?.gradient?.points?.forEach((point, i) =>
		{
			this._data[i] ??= {};
			if (point?.color?.xy && (this._data[i].color?.xy?.x != point?.color?.xy?.x || this._data[i].color?.xy?.y != point?.color?.xy?.y))
			{
				LightData.setColor(this._data[i], point.color.xy);
				this._parent.emit("gradient_color", i, new Color(point.color.xy));
			}
		});
	}

	_getData()
	{
		let result = {};
		let data = (this._parent.isExists()) ? this._update : this._data;

		result.gradient ??= {};
		result.gradient.points = data;
		return (result);
	}

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
		if (index < 0 || index > 4)
			throw new Error(`The index must have between 0 and 4`);
		checkParam(this, "setColor", "color", color, [Color, "string", "object"]);
		if (this._parent.isExists())
		{
			this._update[index] ??= {};
			LightData.setColor(this._update[index], color);
			if (this._sender)
			{
				if (!this._sender._prepareUpdate)
					return (this._sender.update());
				else
					this._sender._updatedService[this._parent.getID()] = this._parent;
			}
		}
		else
			LightData.setColor(this._data[index], color);
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
			throw new Error(`The maximum number of point in gradient is 5`);
		checkParam(this, "addColor", "color", color, [Color, "string", "object"]);
		if (this._parent.isExists())
		{
			LightData.setColor(data, color);
			this._update.push(data);
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
			LightData.setColor(data, color);
			this._data.push(data);
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
		if (this._update[index]?.color?.xy || this._data[index]?.color?.xy)
			return (new Color(this._update[index]?.color?.xy ?? this._data[index]?.color?.xy))
	}

	/**
	 * Gets the list of color
	 * 
	 * @returns {Color[]}
	 */
	getColors()
	{return ((this._update ?? this._data ?? []).map(point => new Color(point.color.xy)))}

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
			throw new Error(`The index must have between 0 and 4`);
		if (this._parent.isExists())
		{
			this._update[index] = undefined;
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
			this._data[index] = undefined;
		}
		return (this);
	}
}
