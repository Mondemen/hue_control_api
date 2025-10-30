import { number } from "yup";
import { Public } from "../../types/global";
import Resource, { ResourceEvents } from "../api/Resource";
import LightService from "../api/service/LightService";
import Color, { ColorValue, XYValue } from "./Color";
import Mired from "./Mired";
import { PowerupColorMode, PowerupDimmingMode, PowerupGet, PowerupPreset, PowerupStateMode } from "../api/types/capability/powerup";
import { ColorGamut } from "../api/types/capability/color";
import { EventSubscription } from "./EventEmitter";

export interface PowerupEvents extends ResourceEvents
{
	powerup_preset: (preset: PowerupPreset) => void;
	powerup_configured: (configured: boolean) => void;
	powerup_state_mode: (mode: PowerupStateMode) => void;
	powerup_state: (state: boolean) => void;
	powerup_dimming_mode: (mode: PowerupDimmingMode) => void;
	powerup_brightness: (brightness: number) => void;
	powerup_color_mode: (mode: PowerupColorMode) => void;
	powerup_color: (color: Color) => void;
	powerup_color_temperature: (mired: Mired) => void;
}

export interface ResourceWithPowerup extends Public<Resource>
{
	toUpdate: LightService["toUpdate"];
	toCreate: LightService["toCreate"];
	updatable: boolean;
	creatable: boolean;

	colorGamut?: ColorGamut;

	emit<T extends keyof PowerupEvents>(eventName: T, ...args: Parameters<PowerupEvents[T]>): void;
	on<T extends keyof PowerupEvents>(eventName: T, listener: PowerupEvents[T]): EventSubscription;
	once<T extends keyof PowerupEvents>(eventName: T, listener: PowerupEvents[T]): EventSubscription;
	off<T extends keyof PowerupEvents>(eventName: T, listener: PowerupEvents[T]): void;
	removeAllListeners<T extends keyof PowerupEvents>(eventName: T): void;
}

export default class Powerup
{
	private parent: ResourceWithPowerup;

	private preset: PowerupPreset;
	private configured: boolean;
	private stateMode: PowerupStateMode;
	private state?: boolean;
	private dimmingMode?: PowerupDimmingMode;
	private brightness?: number;
	private colorMode?: PowerupColorMode;
	private color?: XYValue;
	private colorTemperature?: number;

	constructor(light: ResourceWithPowerup)
	{
		this.parent = light;
	}

	static setData(powerup: Powerup, data: PowerupGet)
	{
		powerup.setData(data);
	}

	private setData(data: PowerupGet)
	{
		if (data.preset && this.preset !== data.preset)
			this.parent.emit("powerup_preset", this.preset = data.preset);
		if (this.configured !== data.configured)
			this.parent.emit("powerup_configured", this.configured = data.configured);
		if (data.on && this.stateMode !== data.on.mode)
			this.parent.emit("powerup_state_mode", this.stateMode = data.on.mode);
		if (data.on && data.on.on?.on !== undefined && this.state !== data.on.on.on)
			this.parent.emit("powerup_state", this.state = data.on.on.on);
		if (data.dimming)
		{
			if (data.dimming.mode && this.dimmingMode !== data.dimming.mode)
				this.parent.emit("powerup_dimming_mode", this.dimmingMode = data.dimming.mode);
			if (data.dimming.dimming?.brightness !== undefined && this.brightness !== data.dimming.dimming.brightness)
				this.parent.emit("powerup_brightness", this.brightness = data.dimming.dimming.brightness);
		}
		if (data.color)
		{
			if (data.color.mode && this.colorMode !== data.color.mode)
				this.parent.emit("powerup_color_mode", this.colorMode = data.color.mode);
			if (data.color.color && !Color.compareXY(this.color, data.color.color.xy))
				this.parent.emit("powerup_color", new Color(this.color = data.color.color.xy));
			if (data.color.color_temperature !== undefined && this.colorTemperature !== data.color.color_temperature.mirek)
				this.parent.emit("powerup_color_temperature", new Mired(this.colorTemperature = data.color.color_temperature.mirek));
		}
	}

	setPreset(preset: Exclude<PowerupPreset, "custom">)
	{
		this.parent.toUpdate.powerup ??= {preset};
		switch (preset)
		{
			case "powerfail":
			{
				this.parent.toUpdate.powerup.preset = preset;
				this.parent.toUpdate.powerup.on = {mode: "previous"};
				this.parent.toUpdate.powerup.dimming = {mode: "previous"};
				this.parent.toUpdate.powerup.color = {mode: "previous"};
				break;
			}
			case "safety":
			{
				this.parent.toUpdate.powerup.preset = preset;
				this.parent.toUpdate.powerup.on = {mode: "on", on: {on: true}};
				this.parent.toUpdate.powerup.dimming = {mode: "dimming", dimming: {brightness: 100}};
				this.parent.toUpdate.powerup.color = {mode: "color_temperature", color_temperature: {mirek: 366}};
				break;
			}
			case "last_on_state":
			{
				this.parent.toUpdate.powerup.preset = preset;
				this.parent.toUpdate.powerup.on = {mode: "on", on: {on: true}};
				this.parent.toUpdate.powerup.dimming = {mode: "previous"};
				this.parent.toUpdate.powerup.color = {mode: "previous"};
				break;
			}
		}
		this.parent.updatable = true;
		return (this)
	}

	/**
	 * Set state when device is reconnected
	 */
	setState(state: boolean): this;
	setState(mode: Exclude<PowerupStateMode, "on">): this;
	setState(mode: PowerupStateMode | boolean)
	{
		this.parent.toUpdate.powerup ??= {preset: "custom"};
		this.parent.toUpdate.powerup.preset = "custom";
		if (typeof mode === "boolean")
			this.parent.toUpdate.powerup.on = {mode: "on", on: {on: mode}};
		else
			this.parent.toUpdate.powerup.on = {mode};
		this.parent.updatable = true;
		return (this);
	}

	/**
	 * Get curent state mode
	 */
	getStateMode()
	{return (this.parent.toUpdate.powerup?.on?.mode ?? this.stateMode)}

	/**
	 * Get current state
	 */
	getState()
	{return (this.parent.toUpdate.powerup?.on?.on?.on ?? this.state)}

	/**
	 * Set brightness when device is reconnected
	 */
	setBrightness(brighness: number): this;
	setBrightness(mode: Exclude<PowerupDimmingMode, "dimming">): this;
	setBrightness(mode: PowerupDimmingMode | number)
	{
		this.parent.toUpdate.powerup ??= {preset: "custom"};
		this.parent.toUpdate.powerup.preset = "custom";
		if (typeof mode === "number")
			this.parent.toUpdate.powerup.dimming = {mode: "dimming", dimming: {brightness: number().min(0).max(100).required().validateSync(mode)}};
		else
			this.parent.toUpdate.powerup.dimming = {mode};
		this.parent.updatable = true;
		return (this);
	}

	/**
	 * Get curent dimming mode
	 */
	getBrightnessMode()
	{return (this.parent.toUpdate.powerup?.dimming?.mode ?? this.dimmingMode)}

	/**
	 * Get current brightness
	 */
	getBrightness()
	{return (this.parent.toUpdate.powerup?.dimming?.dimming?.brightness)}

	/**
	 * Sets the color temperature when device is reconnected
	 */
	setColorTemperature(color_temperature: Mired | ColorValue | number)
	{
		this.parent.toUpdate.powerup ??= {preset: "custom"};
		this.parent.toUpdate.powerup.preset = "custom";
		this.parent.toUpdate.powerup.color = {mode: "color_temperature", color_temperature: {mirek: new Mired(color_temperature).mirek()}};
		this.parent.updatable = true;
		return (this);
	}

	/**
	 * Sets the color when device is reconnected
	 */
	setColor(color: ColorValue)
	{
		this.parent.toUpdate.powerup ??= {preset: "custom"};
		this.parent.toUpdate.powerup.preset = "custom";
		this.parent.toUpdate.powerup.color = {mode: "color", color: {xy: new Color(color, this.parent.colorGamut).xy()}};
		this.parent.updatable = true;
		return (this);
	}

	/**
	 * Restore previous color/color temperature when device is reconnected
	 */
	setColorPrevious()
	{
		this.parent.toUpdate.powerup ??= {preset: "custom"};
		this.parent.toUpdate.powerup.preset = "custom";
		this.parent.toUpdate.powerup.color = {mode: "previous"};
		this.parent.updatable = true;
		return (this);
	}

	/**
	 * Get curent color mode
	 */
	getColorMode()
	{return (this.parent.toUpdate.powerup?.color?.mode ?? this.colorMode)}

	/**
	 * Gets the color temperature of light
	 */
	getColorTemperature()
	{
		const mirek = this.parent.toUpdate.powerup?.color?.color_temperature?.mirek ?? this.colorTemperature;

		if (mirek)
			return (new Mired(mirek));
	}
	/**
	 * Gets the color of light
	 */
	getColor(): Color | undefined
	{
		const color = this.parent.toUpdate.powerup?.color?.color?.xy ?? this.color;

		if (color)
			return (new Color(color));
	}

	/**
	 * Gets the current preset
	 */
	getPreset()
	{return (this.parent.toUpdate.powerup?.preset ?? this.preset)}
}
