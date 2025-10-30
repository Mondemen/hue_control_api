import { number } from "yup";
import { Public } from "../../types/global";
import Resource, { ResourceEvents } from "../api/Resource";
import { GradientGet, GradientMode, GradientSet } from "../api/types/capability/gradient";
import Color, { ColorValue } from "./Color";
import ExtError from "./error";
import { EventSubscription } from "./EventEmitter";

export interface GradientEvents extends ResourceEvents
{
	gradient_color: (i: number, color: Color) => void;
	gradient_mode: (mode: GradientMode) => void;
}

export interface ResourceWithGradient extends Public<Resource>
{
	toUpdate: {gradient?: GradientSet};
	toCreate: {gradient?: GradientSet};
	updatable: boolean;
	creatable: boolean;

	emit<T extends keyof GradientEvents>(eventName: T, ...args: Parameters<GradientEvents[T]>): void;
	on<T extends keyof GradientEvents>(eventName: T, listener: GradientEvents[T]): EventSubscription;
	once<T extends keyof GradientEvents>(eventName: T, listener: GradientEvents[T]): EventSubscription;
	off<T extends keyof GradientEvents>(eventName: T, listener: GradientEvents[T]): void;
	removeAllListeners<T extends keyof GradientEvents>(eventName: T): void;
}

export default class Gradient
{
	private parent: ResourceWithGradient;

	private points: GradientGet["points"];
	private mode: GradientMode;
	private modeValues: GradientMode[];
	private pointsCapable: number;
	private pixelCount?: number;

	constructor(parent: ResourceWithGradient)
	{
		this.parent = parent;
	}

	static setData(gradient: Gradient, data: GradientGet)
	{
		gradient.setData(data);
	}

	private setData(data: GradientGet)
	{
		if (data.points)
		{
			this.points = data.points.map((point, i) =>
			{
				if (!Color.compareXY(this.points[i].color.xy, point.color.xy))
					this.parent.emit("gradient_color", i, new Color(point.color.xy));
				return (point);
			});
		}
		if (data.mode && data.mode !== this.mode)
			this.parent?.emit("gradient_mode", this.mode = data.mode);
		if (data.mode_values)
			this.modeValues = data.mode_values;
		if (data.points_capable !== undefined)
			this.pointsCapable = data.points_capable;
		if (data.pixel_count !== undefined)
			this.pixelCount = data.pixel_count;
	}

	/**
	 * Sets color and brightness at the index
	 */
	setColor(index: number, color: ColorValue)
	{
		const data = this.parent.exists ? this.parent.toUpdate : this.parent.toCreate;

		index = number().min(0).max(4).required().validateSync(index);
		data.gradient ??= {points: []};
		data.gradient.points ??= [];
		data.gradient.points[index] = {color: {xy: new Color(color).xy()}};
		if (this.parent.exists)
			this.parent.updatable = true;
		else
			this.parent.creatable = true;
		return (this);
	}

	/**
	 * Add color
	 */
	addColor(color: ColorValue)
	{
		const data = this.parent.exists ? this.parent.toUpdate : this.parent.toCreate;

		number().max(5, "The maximum number of point in gradient is 5").validateSync(data.gradient?.points.length);
		data.gradient ??= { points: [] };
		data.gradient.points ??= [];
		data.gradient.points.push({color: {xy: new Color(color).xy()}});
		if (this.parent.exists)
			this.parent.updatable = true;
		else
			this.parent.creatable = true;
	}

	/**
	 * Gets color from index
	 */
	getColor(index: number)
	{
		const color = !this.parent.exists ? this.parent.toCreate.gradient?.points[index] : (this.parent.toUpdate.gradient?.points[index] ?? this.points[index]);

		if (color)
			return (new Color(color.color.xy));
	}

	/**
	 * Gets the list of color
	 */
	getColors()
	{
		const colors = !this.parent.exists ? this.parent.toCreate.gradient?.points : (this.parent.toUpdate.gradient?.points ?? this.points);

		if (colors)
			return (colors.map(({color}) => new Color(color.xy)));
	}

	/**
	 * Remove color
	 */
	removeColor(index: number)
	{
		const data = this.parent.exists ? this.parent.toUpdate : this.parent.toCreate;

		index = number().min(0).max(4).required().validateSync(index);
		data.gradient ??= {points: []};
		data.gradient.points ??= [];
		data.gradient.points = data.gradient.points.splice(index, 1);
		if (this.parent.exists)
			this.parent.updatable = true;
		else
			this.parent.creatable = true;
		return (this);
	}

	/**
	 * Set mode in which the points are currently being deployed
	 */
	setMode(mode: GradientMode)
	{
		const data = this.parent.exists ? this.parent.toUpdate : this.parent.toCreate;

		if (this.modeValues && !this.modeValues.includes(mode))
			throw new ExtError("Gradient mode not supported");
		data.gradient ??= {points: []};
		data.gradient.mode = mode;
		if (this.parent.exists)
			this.parent.updatable = true;
		else
			this.parent.creatable = true;
		return (this);
	}

	/**
	 * Get mode in which the points are currently being deployed
	 */
	getMode()
	{return (!this.parent.exists ? this.parent.toCreate.gradient?.mode : (this.parent.toUpdate.gradient?.mode ?? this.mode))}

	getSupportedMode()
	{return (this.modeValues)}

	/**
	 * Get the number of color points that gradient is capable of showing with gradience
	 */
	getPointsCapable()
	{return (this.pointsCapable)}

	/**
	 * Get the number of pixels in the device
	 */
	getPixelCount()
	{return (this.pixelCount)}
}
