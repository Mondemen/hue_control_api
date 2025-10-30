import { number } from "yup";
import { Public } from "../../types/global";
import Resource, { ResourceEvents } from "../api/Resource";
import { PaletteGet, PaletteSet } from "../api/types/capability/palette";
import Color, { ColorValue } from "./Color";
import { EventSubscription } from "./EventEmitter";
import Mired from "./Mired";
import { EffectType } from "../api/types/capability/effect_v2";

export interface PaletteEvents extends ResourceEvents
{
	palette_color: (i: number, color: Color) => void;
	palette_color_brightness: (i: number, brightness: number) => void;
	palette_color_temperature: (mired: Mired) => void;
	palette_color_temperature_brightness: (brightness: number) => void;
	palette_brightness: (brightness: number) => void;
	palette_effect: (i: number, effect: EffectType) => void;
	palette_effect_color: (i: number, effect: EffectType, color: Color) => void;
	palette_effect_color_temperature: (i: number, effect: EffectType, mirek?: Mired) => void;
	palette_effect_speed: (i: number, effect: EffectType, speed: number) => void;
	palette: (palette: Palette) => void;
	speed: (speed: number) => void;
}

export interface ResourceWithPalette extends Public<Resource>
{
	toUpdate: {palette?: PaletteSet, speed: number};
	toCreate: {palette?: PaletteSet, speed: number};
	updatable: boolean;
	creatable: boolean;

	speed: number;

	emit<T extends keyof PaletteEvents>(eventName: T, ...args: Parameters<PaletteEvents[T]>): void;
	on<T extends keyof PaletteEvents>(eventName: T, listener: PaletteEvents[T]): EventSubscription;
	once<T extends keyof PaletteEvents>(eventName: T, listener: PaletteEvents[T]): EventSubscription;
	off<T extends keyof PaletteEvents>(eventName: T, listener: PaletteEvents[T]): void;
	removeAllListeners<T extends keyof PaletteEvents>(eventName: T): void;
}

export default class Palette
{
	private parent: ResourceWithPalette;

	private color: PaletteGet["color"] = [];
	private colorTemperature: PaletteGet["color_temperature"] = [];
	private dimming: PaletteGet["dimming"] = [];
	private effects: PaletteGet["effects"];
	private effectsV2: PaletteGet["effects_v2"];

	constructor(parent: ResourceWithPalette)
	{
		this.parent = parent;
	}

	static setData(palette: Palette, data: PaletteGet)
	{
		palette.setData(data);
	}

	setData(data: PaletteGet)
	{
		let update = false;

		if (data.color)
		{
			update = true;
			this.color = data.color?.map((color, i) =>
			{
				if (color.color.xy && !Color.compareXY(this.color.at(i)?.color.xy, color.color.xy))
					this.parent.emit("palette_color", i, new Color(color.color.xy));
				if (typeof color.dimming.brightness === "number" && this.color.at(i)?.dimming.brightness !== color.dimming.brightness)
					this.parent.emit("palette_color_brightness", i, color.dimming.brightness);
				return (color);
			});
			if (!this.parent.toUpdate.palette?.color)
			{
				this.parent.toUpdate.palette ??= {color: [], color_temperature: [], dimming: []};
				this.parent.toUpdate.palette.color = this.color;
			}
		}
		if (data.color_temperature)
		{
			update = true;
			this.colorTemperature = data.color_temperature?.map((colorTemperature, i) =>
			{
				if (typeof colorTemperature.color_temperature.mirek === "number" && this.colorTemperature.at(i)?.color_temperature.mirek !== colorTemperature.color_temperature.mirek)
					this.parent.emit("palette_color_temperature", new Mired(colorTemperature.color_temperature.mirek));
				if (typeof colorTemperature.dimming.brightness === "number" && this.color.at(i)?.dimming.brightness !== colorTemperature.dimming.brightness)
					this.parent.emit("palette_color_temperature_brightness", colorTemperature.dimming.brightness);
				return (colorTemperature);
			});
			if (!this.parent.toUpdate.palette?.color_temperature)
			{
				this.parent.toUpdate.palette ??= {color: [], color_temperature: [], dimming: []};
				this.parent.toUpdate.palette.color_temperature = this.colorTemperature;
			}
		}
		if (data.dimming)
		{
			update = true;
			this.dimming = data.dimming?.map((dimming, i) =>
			{
				if (typeof dimming.brightness === "number" && this.dimming.at(i)?.brightness !== dimming.brightness)
					this.parent.emit("palette_brightness", dimming.brightness);
				return (dimming);
			});
			if (!this.parent.toUpdate.palette?.dimming)
			{
				this.parent.toUpdate.palette ??= {color: [], color_temperature: [], dimming: []};
				this.parent.toUpdate.palette.dimming = this.dimming;
			}
		}
		if (update)
			this.parent.emit("palette", this);
		if (data.effects_v2)
		{
			this.effectsV2 = data.effects_v2?.map((effect, i) =>
			{
				if (effect.action.effect && this.effectsV2?.at(i)?.action.effect !== effect.action.effect)
					this.parent.emit("palette_effect", i, effect.action.effect);
				if (effect.action.parameters?.color?.xy && !Color.compareXY(this.effectsV2?.at(i)?.action.parameters?.color?.xy, effect.action.parameters?.color.xy))
					this.parent.emit("palette_effect_color", i, effect.action.effect, new Color(effect.action.parameters?.color.xy));
				if (typeof effect.action.parameters?.color_temperature?.mirek === "number" && this.effectsV2?.at(i)?.action.parameters?.color_temperature?.mirek !== effect.action.parameters?.color_temperature?.mirek)
					this.parent.emit("palette_effect_color_temperature", i, effect.action.effect, new Mired(effect.action.parameters?.color_temperature?.mirek));
				if (typeof effect.action.parameters?.speed === "number" && this.effectsV2?.at(i)?.action.parameters?.speed !== effect.action.parameters?.speed)
					this.parent.emit("palette_effect_speed", i, effect.action.effect, effect.action.parameters?.speed);
				return (effect);
			});
			if (!this.parent.toUpdate.palette?.effects)
			{
				this.parent.toUpdate.palette ??= {color: [], color_temperature: [], dimming: []};
				this.parent.toUpdate.palette.effects = this.effects;
			}
		}
		else if (data.effects)
		{
			this.effects = data.effects?.map((effect, i) =>
			{
				if (effect.effect && this.effects?.at(i)?.effect !== effect.effect)
					this.parent.emit("palette_effect", i, effect.effect);
				return (effect);
			});
			if (!this.parent.toUpdate.palette?.effects_v2)
			{
				this.parent.toUpdate.palette ??= {color: [], color_temperature: [], dimming: []};
				this.parent.toUpdate.palette.effects_v2 = this.effectsV2;
			}
		}
	}

	/**
	 * Add color and brightness
	 */
	addColor(color: ColorValue, brightness: number = 100)
	{
		if (this.parent.exists)
		{
			this.parent.toUpdate.palette ??= {color: [], color_temperature: [], dimming: []};
			number().max(9).validateSync(this.parent.toUpdate.palette.color.length);
			this.parent.toUpdate.palette.color.push(
			{
				color: {xy: new Color(color).xy()},
				dimming: {brightness}
			});
			this.parent.updatable = true;
		}
		else
		{
			this.parent.toCreate.palette ??= {color: [], color_temperature: [], dimming: []};
			number().max(9).validateSync(this.parent.toCreate.palette.color.length);
			this.parent.toCreate.palette.color.push(
			{
				color: {xy: new Color(color).xy()},
				dimming: {brightness}
			});
			this.parent.creatable = true;
		}
		return (this);
	}

	deleteColor(callback: (color: Color, brightness: number, index: number) => boolean)
	{
		if (this.parent.exists)
			this.parent.toUpdate.palette?.color.filter((color, i) => !callback(new Color(color.color.xy), color.dimming.brightness, i));
		else
			this.parent.toCreate.palette?.color.filter((color, i) => !callback(new Color(color.color.xy), color.dimming.brightness, i));
		return (this);
	}

	/**
	 * Gets the list of color
	 */
	getColors()
	{
		const toColor = (color: PaletteGet["color"][number]) => ({color: new Color(color.color.xy), brightness: color.dimming.brightness});

		return ((this.parent.exists ? this.parent.toUpdate.palette?.color.map(toColor) : this.parent.toCreate.palette?.color.map(toColor)) ?? this.color.map(toColor));
	}

	clearColors()
	{
		if (this.parent.exists)
		{
			this.parent.toUpdate.palette ??= {color: [], color_temperature: [], dimming: []};
			this.parent.toUpdate.palette.color = [];
		}
		else
		{
			this.parent.toCreate.palette ??= {color: [], color_temperature: [], dimming: []};
			this.parent.toCreate.palette.color = [];
		}
		return (this);
	}

	/**
	 * Sets color temperature and brightness
	 */
	setColorTemperature(mired: Mired | ColorValue | number, brightness: number = 100)
	{
		if (this.parent.exists)
		{
			this.parent.toUpdate.palette ??= {color: [], color_temperature: [], dimming: []};
			this.parent.toUpdate.palette.color_temperature =
			[{
				color_temperature: {mirek: new Mired(mired).mirek()},
				dimming: {brightness}
			}];
			this.parent.updatable = true;
		}
		else
		{
			this.parent.toCreate.palette ??= {color: [], color_temperature: [], dimming: []};
			this.parent.toCreate.palette.color_temperature =
			[{
				color_temperature: {mirek: new Mired(mired).mirek()},
				dimming: {brightness}
			}];
			this.parent.creatable = true;
		}
		return (this);
	}

	/**
	 * Gets color temperature and brightness
	 */
	getColorTemperature()
	{
		const toColorTemperature = (color: PaletteGet["color_temperature"][number]) => ({colorTemperature: new Mired(color.color_temperature.mirek), brightness: color.dimming.brightness});

		return ((this.parent.exists ? this.parent.toUpdate.palette?.color_temperature.map(toColorTemperature) : this.parent.toCreate.palette?.color_temperature.map(toColorTemperature))?.at(0) ?? this.colorTemperature.map(toColorTemperature).at(0));
	}

	/**
	 * Remove color temperature and brightness
	 */
	deleteColorTemperature()
	{
		if (this.parent.exists)
		{
			this.parent.toUpdate.palette ??= {color: [], color_temperature: [], dimming: []};
			this.parent.toUpdate.palette.color_temperature = [];
		}
		else
		{
			this.parent.toCreate.palette ??= {color: [], color_temperature: [], dimming: []};
			this.parent.toCreate.palette.color_temperature = [];
		}
		return (this);
	}

	/**
	 * Sets brightness
	 */
	setBrightness(brightness: number)
	{
		if (this.parent.exists)
		{
			this.parent.toUpdate.palette ??= {color: [], color_temperature: [], dimming: []};
			this.parent.toUpdate.palette.dimming = [{brightness}];
			this.parent.updatable = true;
		}
		else
		{
			this.parent.toCreate.palette ??= {color: [], color_temperature: [], dimming: []};
			this.parent.toCreate.palette.dimming = [{brightness}];
			this.parent.creatable = true;
		}
		return (this);
	}

	getBrightness()
	{return ((this.parent.exists ? this.parent.toUpdate.palette?.dimming.at(0)?.brightness : this.parent.toCreate.palette?.dimming.at(0)?.brightness) ?? this.dimming.at(0)?.brightness)}

	deleteBrightness()
	{
		if (this.parent.exists)
		{
			this.parent.toUpdate.palette ??= {color: [], color_temperature: [], dimming: []};
			this.parent.toUpdate.palette.dimming = [];
		}
		else
		{
			this.parent.toCreate.palette ??= {color: [], color_temperature: [], dimming: []};
			this.parent.toCreate.palette.dimming = [];
		}
		return (this);
	}

	/**
	 * Gets the list of color
	 */
	getEffects()
	{
		return ((this.parent.exists ? this.parent.toUpdate.palette?.effects_v2 : this.parent.toCreate.palette?.effects_v2) ?? this.effectsV2);
	}

	/**
	 * Sets the speed of the dynamic palette
	 */
	setSpeed(speed: number)
	{
		speed = number().min(0).max(1).required().validateSync(speed);
		if (this.parent.exists)
		{
			this.parent.toUpdate.speed = speed;
			this.parent.updatable = true;
		}
		else
		{
			this.parent.toCreate.speed = speed;
			this.parent.creatable = true;
		}
		return (this);
	}

	/**
	 * Gets speed of the dynamic palette
	 */
	getSpeed(): number
	{return ((this.parent.exists ? this.parent.toUpdate.speed : this.parent.toCreate.speed) ?? this.parent.speed)}
}
