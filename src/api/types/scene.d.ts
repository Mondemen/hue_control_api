import { ColorSet } from "./capability/color";
import { ColorTemperatureSet } from "./capability/color_temperature";
import { DimmingSet } from "./capability/dimming";
import { DynamicsSet } from "./capability/dynamics";
import { EffectSet } from "./capability/effect";
import { EffectV2Set } from "./capability/effect_v2";
import { GradientSet } from "./capability/gradient";
import { OnSet } from "./capability/on";
import { PaletteGet, PaletteSet } from "./capability/palette";
import { ResourceGet, ResourceIdentifier } from "./resource";

export type SceneLightCapability = "dimming" | "color_temperature" | "color" | "gradient" | "effect" | "effect_v2";
export type SceneStatus = "inactive" | "static" | "dynamic_palette";
export type SceneRecallAction = "active" | "dynamic_palette" | "static";

export interface SceneActionGet
{
	/** The identifier of the light to execute the action on */
	target: ResourceIdentifier<"light">,
	/** The action to be executed on recall */
	action:
	{
		on?: Required<OnSet>,
		dimming?: Required<DimmingSet>,
		color?: Required<ColorSet>,
		color_temperature?: Required<ColorTemperatureSet>,
		/** Basic feature containing gradient properties. */
		gradient?: Required<GradientSet>,
		/** Basic feature containing effect properties. */
		effects?: Required<EffectSet>,
		effects_v2?: Required<EffectV2Set>,
		dynamics?: Pick<DynamicsSet, "duration">
	}
}

export interface SceneGet extends ResourceGet
{
	type: "scene",
	metadata:
	{
		/** Human readable name of a resource */
		name: string,
		/** Reference with unique identifier for the image representing the scene only accepting "rtype": "public_image" on creation */
		image?: ResourceIdentifier,
		/** Application specific data. Free format string. */
		appdata?: string
	},
	/**
	 * Group associated with this Scene. All services in the group are part of this scene.
	 * If the group is changed the scene is update (e.g. light added/removed)
	 */
	group: ResourceIdentifier<"room" | "zone">,
	/** List of actions to be executed synchronously on recall */
	actions: SceneActionGet[],
	/** Group of colors that describe the palette of colors to be used when playing dynamics */
	palette?: PaletteGet,
	/** Speed of dynamic palette for this scene */
	speed: number,
	/** Indicates whether to automatically start the scene dynamically on active recall */
	auto_dynamic: boolean,
	status: SceneStatus
}

export interface SceneActionSet
{
	/** The identifier of the light to execute the action on */
	target: ResourceIdentifier<"light">,
	/** The action to be executed on recall */
	action:
	{
		on?: OnSet,
		dimming?: DimmingSet,
		color?: ColorSet,
		color_temperature?: ColorTemperatureSet,
		/** Basic feature containing gradient properties. */
		gradient?: GradientSet,
		/** Basic feature containing effect properties. */
		effects?: EffectSet,
		effects_v2?: EffectV2Set,
		dynamics?: Pick<DynamicsSet, "duration">
	}
}

export interface SceneSet
{
	metadata?: Partial<Omit<SceneGet["metadata"], "image">>,
	/** List of actions to be executed synchronously on recall */
	actions?: SceneActionSet[],
	/** Group of colors that describe the palette of colors to be used when playing dynamics */
	palette?: PaletteSet,
	recall?:
	{
		/**
		 * When writing active, the actions in the scene are executed on the target.
		 * dynamic_palette starts dynamic scene with colors in the Palette object.
		 */
		action?: SceneRecallAction,
		/** Transition to the scene within the timeframe given by duration */
		duration?: number,
		/** Override the scene dimming/brightness */
		dimming?: DimmingSet
	},
	/** Speed of dynamic palette for this scene */
	speed?: number,
	/** Indicates whether to automatically start the scene dynamically on active recall */
	auto_dynamic?: boolean
}

export type SceneSetNoRecall = Omit<SceneSet, "recall">;

export type SceneCreate = Omit<SceneGet, keyof ResourceGet | "speed" | "auto_dynamic" | "status"> & Pick<SceneSet, "speed" | "auto_dynamic">
