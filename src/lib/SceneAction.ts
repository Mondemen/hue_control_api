import { UUID } from "crypto";
import { number } from "yup";
import { Public } from "../../types/global";
import Resource, { ResourceEvents } from "../api/Resource";
import { EffectType } from "../api/types/capability/effect_v2";
import { SceneActionGet, SceneActionSet, SceneLightCapability } from "../api/types/scene";
import Color, { ColorValue, XYValue } from "./Color";
import EventListener, { EventSubscription } from "./EventEmitter";
import GradientScene, { ResourceWithGradient } from "./GradientScene";
import Mired from "./Mired";
import Registry from "../api/Registry";

const CAPABILITY_NAMES =
{
	dimming: "Dimming",
	color_temperature: "Color temperature",
	color: "Color",
	gradient: "Gradient",
	effect: "Effects",
	effect_color: "Effects with color",
	effect_color_temperature: "Effects with color temperature",
	effect_speed: "Effects with speed",
	effect_v2: "Effects V2"
};

export interface SceneActionEvents extends ResourceEvents
{
	state: (state: boolean) => void;
	brightness: (brightness: number) => void;
	color_temperature: (mirek?: Mired) => void;
	color: (color: Color) => void;
	duration: (duration: number) => void;
	effect: (effect: EffectType) => void;
	effect_color: (effect: EffectType, color: Color) => void;
	effect_color_temperature: (effect: EffectType, mirek?: Mired) => void;
	effect_speed: (effect: EffectType, speed: number) => void;
	unsupported_capability: (capability: keyof typeof CAPABILITY_NAMES) => void;
}

export interface ResourceWithSceneAction extends Public<Resource>
{
	registry: Registry;
	updatable: boolean;
	creatable: boolean;

	emit<T extends keyof SceneActionEvents>(eventName: T, ...args: Parameters<SceneActionEvents[T]>): void;
	on<T extends keyof SceneActionEvents>(eventName: T, listener: SceneActionEvents[T]): EventSubscription;
	once<T extends keyof SceneActionEvents>(eventName: T, listener: SceneActionEvents[T]): EventSubscription;
	off<T extends keyof SceneActionEvents>(eventName: T, listener: SceneActionEvents[T]): void;
	removeAllListeners<T extends keyof SceneActionEvents>(eventName: T): void;
}

export default class SceneAction extends EventListener
{
	private parent: ResourceWithSceneAction;
	private id: UUID;

	private toUpdate: SceneActionSet = {} as any;
	private toCreate: SceneActionGet = {} as any;

	private targetID: UUID;
	private capabilities: Set<SceneLightCapability> = new Set();
	private state: boolean;
	private brightness?: number;
	private mirek?: number;
	private color?: XYValue;
	private duration?: number;
	private gradient?: GradientScene;
	private effect?: EffectType;
	private effectColor?: XYValue;
	private effectMirek?: number;
	private effectSpeed?: number;

	constructor(parent: ResourceWithSceneAction, id: UUID)
	{
		super();
		this.parent = parent;
		this.id = id;
		this.toCreate.target = {rid: id, rtype: "light"};
	}

	static setData(sceneAction?: SceneAction, data?: SceneActionGet)
	{
		if (data)
			sceneAction?.setData(data);
	}

	private setData(data: SceneActionGet)
	{
		if (data.target)
		{
			this.targetID = data.target.rid;
			this.toUpdate.target = {rid: this.targetID, rtype: "light"};
			this.toCreate.target = {rid: this.targetID, rtype: "light"};
		}
		if (data.action)
		{
			this.toUpdate.action ??= {};
			this.toCreate.action ??= {};
			// State
			if (data.action.on && this.state !== data.action.on?.on)
			{
				this.emit("state", this.state = data.action.on.on);
				this.toUpdate.action.on = {on: this.state};
			}
			// Dimming
			if (data.action.dimming && this.brightness !== data.action.dimming.brightness)
			{
				this.emit("brightness", this.brightness = data.action.dimming.brightness);
				this.toUpdate.action.dimming = {brightness: this.brightness};
			}
			// Color temperature
			if (typeof data.action.color_temperature?.mirek === "number" && this.mirek !== data.action.color_temperature.mirek)
			{
				this.emit("color_temperature", new Mired(this.mirek = data.action.color_temperature.mirek));
				this.toUpdate.action.color_temperature = {mirek: this.mirek};
			}
			// Color
			if (data.action.color && !Color.compareXY(data.action.color.xy, this.color))
			{
				this.emit("color", new Color(this.color = data.action.color.xy));
				this.toUpdate.action.color = {xy: this.color};
			}
			// Duration
			if (typeof data.action.dynamics?.duration === "number" && this.duration !== data.action.dynamics.duration)
			{
				this.emit("duration", this.duration = data.action.dynamics.duration);
				this.toUpdate.action.dynamics = {duration: this.duration};
			}
			// Gradient
			if (data.action.gradient)
			{
				this.gradient ??= new GradientScene(this as unknown as ResourceWithGradient);
				GradientScene.setData(this.gradient, data.action.gradient);
				this.toUpdate.action.gradient = data.action.gradient;
			}
			// Effect
			if (data.action.effects_v2)
			{
				this.toUpdate.action.effects_v2 ??= {};
				if (data.action.effects_v2.action.effect && this.effect !== data.action.effects_v2.action.effect)
				{
					this.emit("effect", this.effect = data.action.effects_v2.action.effect);
					this.toUpdate.action.effects_v2.action ??= {effect: this.effect};
					this.toUpdate.action.effects_v2.action.effect = this.effect;
					if (data.action.effects_v2.action.parameters)
					{
						this.toUpdate.action.effects_v2.action.parameters ??= {};
						if (data.action.effects_v2.action.parameters.color)
						{
							this.emit("effect_color", this.effect, new Color(this.effectColor = data.action.effects_v2.action.parameters.color.xy));
							this.toUpdate.action.effects_v2.action.parameters.color = {xy: this.effectColor};
						}
						if (typeof data.action.effects_v2.action.parameters.color_temperature?.mirek === "number" && this.effectMirek !== data.action.effects_v2.action.parameters.color_temperature.mirek)
						{
							this.emit("effect_color_temperature", this.effect, new Mired(this.effectMirek = data.action.effects_v2.action.parameters.color_temperature.mirek));
							this.toUpdate.action.effects_v2.action.parameters.color_temperature = {mirek: this.effectMirek};
						}
						if (typeof data.action.effects_v2.action.parameters.speed === "number" && this.effectSpeed !== data.action.effects_v2.action.parameters.speed)
						{
							this.emit("effect_speed", this.effect, this.effectSpeed = data.action.effects_v2.action.parameters.speed);
							this.toUpdate.action.effects_v2.action.parameters.speed = this.effectSpeed;
						}
					}
				}
			}
			else if (data.action.effects?.effect && this.effect !== data.action.effects.effect)
			{
				this.emit("effect", this.effect = data.action.effects.effect);
				this.toUpdate.action.effects = {effect: this.effect};
			}
		}
	}

	emit<T extends keyof SceneActionEvents>(eventName: T, ...args: Parameters<SceneActionEvents[T]>)
	{
		// TODO
		super.emit(eventName, ...args);
	}
	on<T extends keyof SceneActionEvents>(eventName: T, listener: SceneActionEvents[T]) {return (super.on(eventName, listener))}
	once<T extends keyof SceneActionEvents>(eventName: T, listener: SceneActionEvents[T]) {return (super.once(eventName, listener))}
	off<T extends keyof SceneActionEvents>(eventName: T, listener: SceneActionEvents[T]) {super.off(eventName, listener)}
	removeAllListeners<T extends keyof SceneActionEvents>(eventName: T) {super.removeAllListeners(eventName)}

	getLight()
	{
		const light = this.parent.registry.resources.light.get(this.targetID);

		if (light?.hasCapability("dimming"))
			this.capabilities.add("dimming");
		if (light?.hasCapability("color_temperature"))
			this.capabilities.add("color_temperature");
		if (light?.hasCapability("color"))
			this.capabilities.add("color");
		if (light?.hasCapability("gradient"))
			this.capabilities.add("gradient");
		if (light?.hasCapability("effect"))
			this.capabilities.add("effect");
		if (light?.hasCapability("effect_v2"))
			this.capabilities.add("effect_v2");
		return (light);
	}

	getState()
	{return ((this.parent.exists ? this.toUpdate.action?.on?.on : this.toCreate.action?.on?.on) ?? this.state)}

	setState(state: boolean)
	{
		if (this.parent.exists)
		{
			this.toUpdate.action ??= {};
			this.toUpdate.action.on = {on: state};
			this.parent.updatable = true;
		}
		else
		{
			this.toCreate.action ??= {};
			this.toCreate.action.on = {on: state};
			this.parent.creatable = true;
		}
		return (this);
	}

	getBrightness()
	{return ((this.parent.exists ? this.toUpdate.action?.dimming?.brightness : this.toCreate.action?.dimming?.brightness) ?? this.brightness)}

	setBrightness(brightness: number)
	{
		this.getLight();
		if (!this.capabilities.has("dimming"))
		{
			this.emit("unsupported_capability", "dimming");
			return (this);
		}
		brightness = number().min(0).max(100).required().validateSync(brightness);
		if (this.parent.exists)
		{
			this.toUpdate.action ??= {};
			this.toUpdate.action.dimming = {brightness};
			this.parent.updatable = true;
		}
		else
		{
			this.toCreate.action ??= {};
			this.toCreate.action.dimming = {brightness};
			this.parent.creatable = true;
		}
		return (this);
	}

	getColorTemperature()
	{
		const mirek = this.parent.exists ? this.toUpdate.action.color_temperature?.mirek : this.toCreate.action.color_temperature?.mirek;

		return (typeof mirek === "number" ? new Mired(mirek) : (this.mirek ? new Mired(this.mirek) : undefined));
	}

	setColorTemperature(mired: Mired | ColorValue | number)
	{
		this.getLight();
		if (!this.capabilities.has("color_temperature"))
		{
			this.emit("unsupported_capability", "color_temperature");
			return (this);
		}
		if (this.parent.exists)
		{
			this.toUpdate.action ??= {};
			this.toUpdate.action.color_temperature = {mirek: new Mired(mired).mirek()};
			this.parent.updatable = true;
		}
		else
		{
			this.toCreate.action ??= {};
			this.toCreate.action.color_temperature = {mirek: new Mired(mired).mirek()};
			this.parent.creatable = true;
		}
		return (this);
	}

	getColor()
	{
		const color = this.parent.exists ? this.toUpdate.action.color?.xy : this.toCreate.action.color?.xy;

		return (color ? new Color(color) : (this.color ? new Mired(this.color) : undefined));
	}

	setColor(color: ColorValue)
	{
		const light = this.getLight();

		if (!this.capabilities.has("color"))
		{
			this.emit("unsupported_capability", "color");
			return (this);
		}
		if (this.parent.exists)
		{
			this.toUpdate.action ??= {};
			this.toUpdate.action.color = {xy: new Color(color, light?.getColorGamut()).xy()};
			this.parent.updatable = true;
		}
		else
		{
			this.toCreate.action ??= {};
			this.toCreate.action.color = {xy: new Color(color, light?.getColorGamut()).xy()};
			this.parent.creatable = true;
		}
		return (this);
	}

	getDuration()
	{return ((this.parent.exists ? this.toUpdate.action.dynamics?.duration : this.toCreate.action.dynamics?.duration) ?? this.duration)}

	setDuration(duration: number)
	{
		this.getLight();
		if (this.parent.exists)
		{
			this.toUpdate.action ??= {};
			this.toUpdate.action.dynamics = {duration};
			this.parent.updatable = true;
		}
		else
		{
			this.toCreate.action ??= {};
			this.toCreate.action.dynamics = {duration};
			this.parent.creatable = true;
		}
		return (this);
	}

	getGradient()
	{
		this.getLight();
		if (!this.capabilities.has("gradient"))
		{
			this.emit("unsupported_capability", "gradient");
			return;
		}
		this.gradient ??= new GradientScene(this as unknown as ResourceWithGradient);
		return (this.gradient);
	}

	getEffect()
	{
		const effect = this.parent.exists ? (this.toUpdate.action?.effects_v2?.action?.effect ?? this.toUpdate.action?.effects?.effect) : (this.toCreate.action?.effects_v2?.action?.effect ?? this.toCreate.action?.effects?.effect);

		return (effect ?? this.duration);
	}

	setEffect(effect: EffectType, speed?: number)
	{
		this.getLight();
		if (this.capabilities.has("effect_v2"))
		{
			if (this.parent.exists)
			{
				this.toUpdate.action ??= {};
				this.toUpdate.action.effects_v2 ??= {};
				this.toUpdate.action.effects_v2.action ??= {effect};
				this.toUpdate.action.effects_v2.action.effect = effect;
				if (speed !== undefined)
				{
					speed = number().min(0).max(1).required().validateSync(speed);
					this.toUpdate.action.effects_v2.action.parameters ??= {};
					this.toUpdate.action.effects_v2.action.parameters.speed = speed;
				}
				this.parent.updatable = true;
			}
			else
			{
				this.toCreate.action ??= {};
				this.toCreate.action.effects_v2 ??= {action: {effect}};
				this.toCreate.action.effects_v2.action ??= {effect};
				this.toCreate.action.effects_v2.action.effect = effect;
				if (speed !== undefined)
				{
					speed = number().min(0).max(1).required().validateSync(speed);
					this.toCreate.action.effects_v2.action.parameters ??= {};
					this.toCreate.action.effects_v2.action.parameters.speed = speed;
				}
				this.parent.creatable = true;
			}
		}
		else if (this.capabilities.has("effect"))
		{
			if (speed !== undefined)
				this.emit("unsupported_capability", "effect_speed");
			if (this.parent.exists)
			{
				this.toUpdate.action ??= {};
				this.toUpdate.action.effects = {effect};
				this.parent.updatable = true;
			}
			else
			{
				this.toCreate.action ??= {};
				this.toCreate.action.effects = {effect};
				this.parent.creatable = true;
			}
		}
		else
		{
			this.emit("unsupported_capability", "effect");
			return (this);
		}
		return (this);
	}

	getColorEffect()
	{
		const color = this.parent.exists ? this.toUpdate.action?.effects_v2?.action?.parameters?.color?.xy : this.toCreate.action?.effects_v2?.action?.parameters?.color?.xy;

		return (color ? new Color(color) : (this.effectColor ? new Color(this.effectColor) : undefined))
	}

	setColorEffect(effect: EffectType, color: ColorValue, speed?: number)
	{
		if (!this.capabilities.has("effect_v2"))
		{
			this.emit("unsupported_capability", "effect_color");
			return (this);
		}
		speed = number().min(0).max(1).required().validateSync(speed);
		if (this.parent.exists)
		{
			this.toUpdate.action ??= {};
			this.toUpdate.action.effects_v2 ??= {};
			this.toUpdate.action.effects_v2.action ??= {effect};
			this.toUpdate.action.effects_v2.action.effect = effect;
			this.toUpdate.action.effects_v2.action.parameters ??= {};
			this.toUpdate.action.effects_v2.action.parameters.color = {xy: new Color(color, this.getLight()?.getColorGamut()).xy()};
			if (speed !== undefined)
				this.toUpdate.action.effects_v2.action.parameters.speed = speed;
			this.parent.updatable = true;
		}
		else
		{
			this.toCreate.action ??= {};
			this.toCreate.action.effects_v2 ??= {action: {effect}};
			this.toCreate.action.effects_v2.action ??= {effect};
			this.toCreate.action.effects_v2.action.effect = effect;
			this.toCreate.action.effects_v2.action.parameters ??= {};
			this.toCreate.action.effects_v2.action.parameters.color = {xy: new Color(color, this.getLight()?.getColorGamut()).xy()};
			if (speed !== undefined)
				this.toCreate.action.effects_v2.action.parameters.speed = speed;
			this.parent.creatable = true;
		}
		return (this);
	}

	getColorTemperatureEffect()
	{
		const mirek = this.parent.exists ? this.toUpdate.action?.effects_v2?.action?.parameters?.color_temperature?.mirek : this.toCreate.action?.effects_v2?.action?.parameters?.color_temperature?.mirek;

		return (mirek ? new Mired(mirek) : (this.effectMirek ? new Mired(this.effectMirek) : undefined))
	}

	setColorTemperatureEffect(effect: EffectType, mirek: Mired | ColorValue | number, speed?: number)
	{
		if (!this.capabilities.has("effect_v2"))
		{
			this.emit("unsupported_capability", "effect_color_temperature");
			return (this);
		}
		speed = number().min(0).max(1).required().validateSync(speed);
		if (this.parent.exists)
		{
			this.toUpdate.action ??= {};
			this.toUpdate.action.effects_v2 ??= {};
			this.toUpdate.action.effects_v2.action ??= {effect};
			this.toUpdate.action.effects_v2.action.effect = effect;
			this.toUpdate.action.effects_v2.action.parameters ??= {};
			this.toUpdate.action.effects_v2.action.parameters.color_temperature = {mirek: new Mired(mirek).mirek()};
			if (speed !== undefined)
				this.toUpdate.action.effects_v2.action.parameters.speed = speed;
			this.parent.updatable = true;
		}
		else
		{
			this.toCreate.action ??= {};
			this.toCreate.action.effects_v2 ??= {action: {effect}};
			this.toCreate.action.effects_v2.action ??= {effect};
			this.toCreate.action.effects_v2.action.effect = effect;
			this.toCreate.action.effects_v2.action.parameters ??= {};
			this.toCreate.action.effects_v2.action.parameters.color_temperature = {mirek: new Mired(mirek).mirek()};
			if (speed !== undefined)
				this.toCreate.action.effects_v2.action.parameters.speed = speed;
			this.parent.creatable = true;
		}
		return (this);
	}

	getEffectSpeed()
	{return ((this.parent.exists ? this.toUpdate.action?.effects_v2?.action?.parameters?.speed : this.toCreate.action?.effects_v2?.action?.parameters?.speed) ?? this.effectSpeed)}
}
