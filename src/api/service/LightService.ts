import { number } from "yup";
import Service, { ServiceEvents } from ".";
import Color, { ColorValue, isHSL, isHSV, isRGB, isXY, XYValue } from "../../lib/Color";
import Gradient, { GradientEvents, ResourceWithGradient } from "../../lib/Gradient";
import Mired from "../../lib/Mired";
import Powerup, { PowerupEvents, ResourceWithPowerup } from "../../lib/Powerup";
import Light from "../device/Light";
import { AlertType } from "../types/capability/alert";
import { ColorGamut, ColorGamutType } from "../types/capability/color";
import { DynamicStatus } from "../types/capability/dynamics";
import { EffectType } from "../types/capability/effect_v2";
import { SignalType } from "../types/capability/signaling";
import { TimedEffectType } from "../types/capability/timed_effect";
import { LightCapability, LightFunction, LightGet, LightMode, LightSet } from "../types/light";
import { ArcheType, PartialResource } from "../types/resource";

const CAPABILITY_NAMES =
{
	dimming: "Dimming",
	dimming_delta: "Dimming delta",
	color_temperature: "Color temperature",
	color_temperature_delta: "Color temperature delta",
	color: "Color",
	dynamic: "Dynamic",
	gradient: "Gradient",
	effect: "Effects",
	effect_color: "Effects with color",
	effect_color_temperature: "Effects with color temperature",
	effect_speed: "Effects with speed",
	effect_v2: "Effects V2",
	timed_effect: "Timed effect",
	powerup: "Powerup",
	identify: "Identify",
	alert: "Alert",
	signaling: "Signaling"
};

export interface LightServiceEvents extends ServiceEvents, GradientEvents, PowerupEvents
{
	name: (name: string) => void;
	function: (functionType: LightFunction) => void;
	state: (state: boolean) => void;
	brightness: (brightness: number) => void;
	color_temperature: (mirek?: Mired) => void;
	color: (color: Color) => void;
	dynamic_status: (status: DynamicStatus) => void;
	dynamic_speed: (speed?: number) => void;
	effect: (effect: EffectType) => void;
	effect_color: (effect: EffectType, color: Color) => void;
	effect_color_temperature: (effect: EffectType, mirek?: Mired) => void;
	effect_speed: (effect: EffectType, speed: number) => void;
	timed_effect: (effect: TimedEffectType) => void;
	mode: (mode: LightMode) => void;
	unsupported_capability: (capability: keyof typeof CAPABILITY_NAMES) => void;
}

export default class LightService extends Service
{
	declare protected toUpdate: LightSet;

	private capabilities: Set<LightCapability> = new Set();
	private name: string;
	private fixedMired?: number;
	private function: LightFunction;
	private productName?: string;
	private productArchetype?: ArcheType;
	private productFunction?: LightFunction;
	private serviceID: number;
	private state: boolean;
	private brightness?: number;
	private minDimLevel?: number;
	private mirek?: number;
	private minMirek?: number;
	private maxMirek?: number;
	private color?: XYValue;
	private colorGamut?: ColorGamut;
	private colorGamutType?: ColorGamutType;
	private dynamicStatus?: DynamicStatus;
	private dynamicStatusValues?: DynamicStatus[];
	private dynamicSpeed?: number;
	private gradient?: Gradient;
	private effect?: EffectType;
	private effectColor?: XYValue;
	private effectMirek?: number;
	private effectSpeed?: number;
	private possibleEffectValues?: EffectType[];
	private supportedEffectValues?: EffectType[];
	private timedEffect?: TimedEffectType;
	private possibleTimedEffectValues?: TimedEffectType[];
	private supportedTimedEffectValues?: TimedEffectType[];
	private powerup?: Powerup;
	private mode: LightMode;
	private alertValues?: AlertType[];
	private signal?: SignalType;
	private signalValues?: SignalType[];
	private signalEstimatedEnd?: Date;
	private signalColors?: XYValue[];

	protected setData(data: PartialResource<LightGet>)
	{
		super.setData(data);

		// Capabilities
		if (data.dimming)
			this.capabilities.add("dimming");
		if (data.dimming_delta)
			this.capabilities.add("dimming_delta");
		if (data.color_temperature)
			this.capabilities.add("color_temperature");
		if (data.color_temperature_delta)
			this.capabilities.add("color_temperature_delta");
		if (data.color)
			this.capabilities.add("color");
		if (data.dynamics)
			this.capabilities.add("dynamic");
		if (data.gradient)
			this.capabilities.add("gradient");
		if (data.effects)
			this.capabilities.add("effect");
		if (data.effects_v2)
			this.capabilities.add("effect_v2");
		if (data.timed_effects)
			this.capabilities.add("timed_effect");
		if (data.powerup)
			this.capabilities.add("powerup");
		if (data.alert)
			this.capabilities.add("alert");
		if (data.identify)
			this.capabilities.add("identify");
		if (data.signaling)
			this.capabilities.add("signaling");

		if (data.metadata)
		{
			// Name
			if (this.name !== data.metadata.name)
				this.emit("name", this.name = data.metadata.name);
			this.fixedMired = data.metadata.fixed_mired;
			// Function
			if (this.function !== data.metadata.function)
				this.emit("function", this.function = data.metadata.function);
		}
		if (data.product_data)
		{
			this.productName = data.product_data.name;
			this.productArchetype = data.product_data.archetype;
			this.productFunction = data.product_data.function;
		}
		if (data.service_id !== undefined)
			this.serviceID = data.service_id;
		// State
		if (data.on && this.state !== data.on?.on)
			this.emit("state", this.state = data.on.on);
		// Dimming
		if (data.dimming)
		{
			if (this.brightness !== data.dimming.brightness)
				this.emit("brightness", this.brightness = data.dimming.brightness);
			this.minDimLevel = data.dimming.min_dim_level;
		}
		// Color temperature
		if (data.color_temperature)
		{
			if (data.color_temperature.mirek_valid && this.mirek !== data.color_temperature.mirek)
				this.emit("color_temperature", new Mired(this.mirek = data.color_temperature.mirek));
			else if (data.color_temperature.mirek_valid === false)
				this.emit("color_temperature", this.mirek = undefined);
			if (data.color_temperature.mirek_schema)
			{
				this.minMirek = data.color_temperature.mirek_schema.mirek_minimum;
				this.maxMirek = data.color_temperature.mirek_schema.mirek_maximum;
			}
		}
		// Color
		if (data.color)
		{
			if (!Color.compareXY(data.color.xy, this.color))
				this.emit("color", new Color(this.color = data.color.xy));
			this.colorGamut = data.color.gamut;
			this.colorGamutType = data.color.gamut_type;
		}
		// Dynamic
		if (data.dynamics)
		{
			if (this.dynamicStatus !== data.dynamics.status)
				this.emit("dynamic_status", this.dynamicStatus = data.dynamics.status);
			this.dynamicStatusValues = data.dynamics.status_value;
			if (data.dynamics.speed_valid && this.dynamicSpeed !== data.dynamics.speed)
				this.emit("dynamic_speed", this.dynamicSpeed = data.dynamics.speed);
			else if (data.dynamics.speed_valid === false)
				this.emit("dynamic_speed", this.dynamicSpeed = undefined);
		}
		// Gradient
		if (data.gradient)
		{
			this.gradient ??= new Gradient(this as unknown as ResourceWithGradient);
			Gradient.setData(this.gradient, data.gradient);
		}
		// Effect
		if (data.effects_v2)
		{
			if (data.effects_v2.status)
			{
				if (this.effect !== data.effects_v2.status.effect)
					this.emit("effect", this.effect = data.effects_v2.status.effect);
				this.possibleEffectValues = data.effects_v2.status.effect_values;
				if (data.effects_v2.status.parameters)
				{
					if (data.effects_v2.status.parameters.color && !Color.compareXY(data.effects_v2.status.parameters.color.xy, this.effectColor))
						this.emit("effect_color", this.effect, new Color(this.effectColor = data.effects_v2.status.parameters.color.xy));
					if (data.effects_v2.status.parameters.color_temperature)
					{
						if (data.effects_v2.status.parameters.color_temperature.mirek_valid && this.mirek !== data.effects_v2.status.parameters.color_temperature.mirek)
							this.emit("effect_color_temperature", this.effect, new Mired(this.mirek = data.effects_v2.status.parameters.color_temperature.mirek));
						else if (data.effects_v2.status.parameters.color_temperature.mirek_valid === false)
							this.emit("effect_color_temperature", this.effect, this.mirek = undefined);
					}
					if (typeof data.effects_v2.status.parameters.speed === "number" && this.effectSpeed !== data.effects_v2.status.parameters.speed)
						this.emit("effect_speed", this.effect, this.effectSpeed = data.effects_v2.status.parameters.speed);
				}
			}
			if (data.effects_v2.action)
				this.supportedEffectValues = data.effects_v2.action.effect_values;

		}
		else if (data.effects)
		{
			if (this.effect !== data.effects.status)
				this.emit("effect", this.effect = data.effects.status);
			this.possibleEffectValues = data.effects.status_values;
			this.supportedEffectValues = data.effects.effect_values;
		}
		// Timed effect
		if (data.timed_effects)
		{
			if (this.timedEffect !== data.timed_effects.status)
				this.emit("timed_effect", this.timedEffect = data.timed_effects.status);
			this.possibleTimedEffectValues = data.timed_effects.status_values;
			this.supportedTimedEffectValues = data.timed_effects.effect_values;
		}
		// Powerup
		if (data.powerup)
		{
			this.powerup ??= new Powerup(this as unknown as ResourceWithPowerup);
			Powerup.setData(this.powerup, data.powerup);
		}
		if (data.alert)
			this.alertValues = data.alert.action_values;
		if (data.signaling)
		{
			if (data.signaling.status)
				this.signal = data.signaling.status.signal;
			this.signalEstimatedEnd = data.signaling.status?.estimated_end;
			this.signalColors = data.signaling.status?.colors.map(color => color.xy);
			this.signalValues = data.signaling.signal_values;
		}
		if (data.mode && this.mode !== data.mode)
			this.emit("mode", this.mode = data.mode);
		if (!this.init)
		{
			this.emit("created");
			this.init = true;
		}
		else
			this.emit("updated");
	}

	emit<T extends keyof LightServiceEvents>(eventName: T, ...args: Parameters<LightServiceEvents[T]>)
	{
		if (eventName === "unsupported_capability")
			console.warn(`${CAPABILITY_NAMES[(args as Parameters<LightServiceEvents["unsupported_capability"]>)[0]]} not supported by the light "${this.name}"`);
		this.getOwner().emit(eventName, ...args);
		super.emit<any>(eventName, ...args);
	}
	on<T extends keyof LightServiceEvents>(eventName: T, listener: LightServiceEvents[T]) {return (super.on<any>(eventName, listener))}
	once<T extends keyof LightServiceEvents>(eventName: T, listener: LightServiceEvents[T]) {return (super.once<any>(eventName, listener))}
	off<T extends keyof LightServiceEvents>(eventName: T, listener: LightServiceEvents[T]) {super.off<any>(eventName, listener)}
	removeAllListeners<T extends keyof LightServiceEvents>(eventName: T) {super.removeAllListeners<any>(eventName)}

	getOwner()
	{return (super.getOwner() as Light)}

	getName()
	{return (this.name)}

	setName(name: string)
	{
		this.toUpdate.metadata ??= {};
		this.toUpdate.metadata.name = name;
		this.updatable = true;
		return (this);
	}

	getFixedMired()
	{return (this.fixedMired)}

	getFunction()
	{return (this.function)}

	setFunction(functionType: LightFunction)
	{
		this.toUpdate.metadata ??= {};
		this.toUpdate.metadata.function = functionType;
		this.updatable = true;
		return (this);
	}

	getProductName()
	{return (this.productName)}

	getProductArchetype()
	{return (this.productArchetype)}

	getProductFunction()
	{return (this.productFunction)}

	getServiceID()
	{return (this.serviceID)}

	async identify()
	{
		const toUpdate = this.toUpdate;
		const updatable = this.updatable;

		if (!this.capabilities.has("identify"))
		{
			this.emit("unsupported_capability", "identify");
			return;
		}
		this.toUpdate = {};
		this.toUpdate.identify = {action: "identify"};
		this.updatable = true;
		await this.update();
		this.toUpdate = toUpdate;
		this.updatable = updatable;
	}

	hasCapability(capability: LightCapability): boolean;
	hasCapability(capabilities: LightCapability[]): boolean;
	hasCapability(value: LightCapability | LightCapability[]): boolean;
	hasCapability(value: LightCapability | LightCapability[])
	{
		if (Array.isArray(value))
			return (value.every(capability => this.capabilities.has(capability)));
		return (this.capabilities.has(value));
	}

	getState()
	{return (this.toUpdate.on?.on ?? this.state)}

	setState(state: boolean)
	{
		if (this.getState() !== state)
		{
			this.toUpdate.on = {on: state};
			this.updatable = true;
		}
		return (this);
	}

	getBrightness()
	{return (this.toUpdate.dimming?.brightness ?? this.brightness)}

	getMinDimLevel()
	{return (this.minDimLevel)}

	setBrightness(brightness: number)
	{
		if (!this.capabilities.has("dimming"))
		{
			this.emit("unsupported_capability", "dimming");
			return (this);
		}
		brightness = number().min(0).max(100).required().validateSync(brightness);
		if (this.getBrightness() !== brightness)
		{
			this.toUpdate.dimming = {brightness};
			this.updatable = true;
		}
		return (this);
	}

	setBrightnessDelta(delta: number | "stop")
	{
		if (!this.capabilities.has("dimming_delta"))
		{
			this.emit("unsupported_capability", "dimming_delta");
			return (this);
		}
		if (delta === "stop")
			this.toUpdate.dimming_delta = {action: delta};
		else
		{
			if (delta < 0)
				this.toUpdate.dimming_delta = {action: "down", brightness_delta: Math.abs(delta)};
			else
				this.toUpdate.dimming_delta = {action: "up", brightness_delta: Math.abs(delta)};
		}
		this.updatable = true;
		return (this);
	}

	getColorTemperature()
	{return (typeof this.toUpdate.color_temperature?.mirek === "number" ? new Mired(this.toUpdate.color_temperature.mirek) : (this.mirek ? new Mired(this.mirek) : undefined))}

	getMinMirek()
	{return (this.minMirek)}

	getMaxMirek()
	{return (this.maxMirek)}

	setColorTemperature(mired: Mired | ColorValue | number)
	{
		if (!this.capabilities.has("color_temperature"))
		{
			this.emit("unsupported_capability", "color_temperature");
			return (this);
		}
		this.toUpdate.color_temperature = {mirek: new Mired(mired).mirek()};
		this.updatable = true;
		return (this);
	}

	setColorTemperatureDelta(delta: number | "stop")
	{
		let mired: number;

		if (!this.capabilities.has("color_temperature_delta"))
		{
			this.emit("unsupported_capability", "color_temperature_delta");
			return (this);
		}
		if (delta === "stop")
			this.toUpdate.color_temperature_delta = {action: delta};
		else
		{
			mired = Math.min(Math.max(Math.abs(delta), 0), 347);
			if (delta < 0)
				this.toUpdate.color_temperature_delta = {action: "down", mirek_delta: mired};
			else
				this.toUpdate.color_temperature_delta = {action: "up", mirek_delta: mired};
		}
		this.updatable = true;
		return (this);
	}

	getColor()
	{return (this.toUpdate.color?.xy ? new Color(this.toUpdate.color.xy) : (this.color ? new Color(this.color) : undefined))}

	setColor(color: ColorValue)
	{
		if (!this.capabilities.has("color"))
		{
			this.emit("unsupported_capability", "color");
			return (this);
		}
		if (color instanceof Color)
			this.toUpdate.color = {xy: color.xy()};
		else if (isXY(color))
			this.toUpdate.color = {xy: color};
		else if (isRGB(color))
			this.toUpdate.color = {xy: Color.RGBToXY(color.r, color.g, color.b, this.colorGamut)};
		else if (isHSV(color))
			this.toUpdate.color = {xy: Color.HSVToXY(color.h, color.s, color.v, this.colorGamut)};
		else if (isHSL(color))
			this.toUpdate.color = {xy: Color.HSLToXY(color.h, color.s, color.l, this.colorGamut)};
		else
			this.toUpdate.color = {xy: new Color(color, this.colorGamut).xy()};
		this.updatable = true;
		return (this);
	}

	getColorGamut()
	{return (this.colorGamut)}

	getColorGamutType()
	{return (this.colorGamutType)}

	getDynamicStatus()
	{return (this.dynamicStatus)}

	getDynamicStatusValues()
	{return (this.dynamicStatusValues)}

	getDynamicSpeed()
	{return (this.dynamicSpeed)}

	setDuration(duration: number)
	{
		if (!this.capabilities.has("dynamic"))
		{
			this.emit("unsupported_capability", "dynamic");
			return (this);
		}
		if (this.toUpdate.dynamics?.duration !== duration)
		{
			this.toUpdate.dynamics ??= {};
			this.toUpdate.dynamics.duration = duration;
			// this.updatable = true;
		}
		return (this);
	}

	setDynamicSpeed(speed: number)
	{
		if (!this.capabilities.has("dynamic"))
		{
			this.emit("unsupported_capability", "dynamic");
			return (this);
		}
		this.toUpdate.dynamics ??= {};
		this.toUpdate.dynamics.speed = speed;
		this.updatable = true;
		return (this);
	}

	getSupportedAlertValues()
	{return (this.alertValues)}

	setAlert(alert: AlertType)
	{
		this.toUpdate.alert = {action: alert};
		this.updatable = true;
		return (this);
	}

	getSignal()
	{return (this.toUpdate.signaling?.signal ?? this.signal)}

	getSupportedSignalingValues()
	{return (this.signalValues)}

	setSignaling(signal: Exclude<SignalType, "no_signal">, duration: number, colors?: ColorValue[])
	{
		if (!this.capabilities.has("signaling"))
		{
			this.emit("unsupported_capability", "signaling");
			return (this);
		}
		if (colors)
		{
			number().min(1).max(2).required().validateSync(colors.length);
			this.toUpdate.signaling = {signal, duration, colors: colors.map(color => ({xy: new Color(color, this.colorGamut).xy()}))};
		}
		else
			this.toUpdate.signaling = {signal, duration};
		this.updatable = true;
		return (this);
	}

	getSignalEstimatedEnd()
	{return (this.signalEstimatedEnd)}

	getSignalColors()
	{return (this.signalColors?.map(color => new Color(color)))}

	getGradient()
	{
		if (!this.capabilities.has("gradient"))
		{
			this.emit("unsupported_capability", "gradient");
			return;
		}
		return (this.gradient);
	}

	getEffect()
	{return (this.toUpdate.effects_v2?.action?.effect ?? this.toUpdate.effects?.effect ?? this.effect)}

	setEffect(effect: EffectType, speed?: number)
	{
		if (this.capabilities.has("effect_v2"))
		{
			this.toUpdate.effects_v2 ??= {};
			this.toUpdate.effects_v2.action ??= {effect};
			this.toUpdate.effects_v2.action.effect = effect;
			if (speed !== undefined)
			{
				speed = number().min(0).max(1).required().validateSync(speed);
				this.toUpdate.effects_v2.action.parameters ??= {};
				this.toUpdate.effects_v2.action.parameters.speed = speed;
			}
		}
		else if (this.capabilities.has("effect"))
		{
			if (speed !== undefined)
				this.emit("unsupported_capability", "effect_speed");
			this.toUpdate.effects = {effect};
		}
		else
		{
			this.emit("unsupported_capability", "effect");
			return (this);
		}
		this.updatable = true;
		return (this);
	}

	getColorEffect()
	{return (this.toUpdate.effects_v2?.action?.parameters?.color?.xy ? new Color(this.toUpdate.effects_v2.action.parameters.color.xy) : (this.effectColor ? new Color(this.effectColor) : undefined))}

	setColorEffect(effect: EffectType, color: ColorValue, speed?: number)
	{
		if (!this.capabilities.has("effect_v2"))
		{
			this.emit("unsupported_capability", "effect_color");
			return (this);
		}
		this.toUpdate.effects_v2 ??= {};
		this.toUpdate.effects_v2.action ??= {effect};
		this.toUpdate.effects_v2.action.effect = effect;
		this.toUpdate.effects_v2.action.parameters ??= {};
		this.toUpdate.effects_v2.action.parameters.color = {xy: new Color(color, this.colorGamut).xy()};
		if (speed !== undefined)
		{
			speed = number().min(0).max(1).required().validateSync(speed);
			this.toUpdate.effects_v2.action.parameters.speed = speed;
		}
		this.updatable = true;
		return (this);
	}

	getColorTemperatureEffect()
	{return (this.toUpdate.effects_v2?.action?.parameters?.color_temperature?.mirek ? new Mired(this.toUpdate.effects_v2.action.parameters.color_temperature.mirek) : (this.effectMirek ? new Mired(this.effectMirek) : undefined))}

	setColorTemperatureEffect(effect: EffectType, mirek: Mired | ColorValue | number, speed?: number)
	{
		if (!this.capabilities.has("effect_v2"))
		{
			this.emit("unsupported_capability", "effect_color_temperature");
			return (this);
		}
		this.toUpdate.effects_v2 ??= {};
		this.toUpdate.effects_v2.action ??= { effect };
		this.toUpdate.effects_v2.action.effect = effect;
		this.toUpdate.effects_v2.action.parameters ??= {};
		this.toUpdate.effects_v2.action.parameters.color_temperature = {mirek: new Mired(mirek).mirek()};
		if (speed !== undefined)
		{
			speed = number().min(0).max(1).required().validateSync(speed);
			this.toUpdate.effects_v2.action.parameters.speed = speed;
		}
		this.updatable = true;
		return (this);
	}

	getEffectSpeed()
	{return (this.toUpdate.effects_v2?.action?.parameters?.speed ?? this.effectSpeed)}

	getPossibleEffectValues()
	{return (this.possibleEffectValues)}

	getEffectValues()
	{return (this.supportedEffectValues)}

	getTimedEffect()
	{return (this.timedEffect)}

	setTimedEffect(effect: TimedEffectType, duration?: number)
	{
		if (!this.capabilities.has("timed_effect"))
		{
			this.emit("unsupported_capability", "timed_effect");
			return (this);
		}
		this.toUpdate.timed_effects = {status: effect, duration};
		this.updatable = true;
		return (this);
	}

	getPossibleTimedEffectValues()
	{return (this.possibleTimedEffectValues)}

	getTimedEffectValues()
	{return (this.supportedTimedEffectValues)}

	getPowerup()
	{
		if (!this.capabilities.has("powerup"))
		{
			this.emit("unsupported_capability", "powerup");
			return;
		}
		return (this.powerup);
	}

	getMode()
	{return (this.mode)}

	async update()
	{await super.update()}
}
