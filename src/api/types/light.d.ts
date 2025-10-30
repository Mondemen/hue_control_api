import { AlertGet, AlertSet } from "./capability/alert";
import { ColorGet, ColorSet } from "./capability/color";
import { ColorTemperatureDelta, ColorTemperatureGet, ColorTemperatureSet } from "./capability/color_temperature";
import { DimmingDelta, DimmingGet, DimmingSet } from "./capability/dimming";
import { DynamicsGet, DynamicsSet } from "./capability/dynamics";
import { EffectGet, EffectSet } from "./capability/effect";
import { EffectV2Get, EffectV2Set } from "./capability/effect_v2";
import { GradientGet, GradientSet } from "./capability/gradient";
import { OnGet, OnSet } from "./capability/on";
import { PowerupGet, PowerupSet } from "./capability/powerup";
import { SignalingGet, SignalingSet } from "./capability/signaling";
import { TimedEffectGet, TimedEffectSet } from "./capability/timed_effect";
import { ArcheType } from "./resource";
import { ServiceGet } from "./service";

export type LightCapability = "dimming" | "dimming_delta" | "color_temperature" | "color_temperature_delta" | "color" | "dynamic" | "gradient" | "effect" | "effect_v2" | "timed_effect" | "powerup" | "identify" | "alert" | "signaling";
export type LightFunction = "functional" | "decorative" | "mixed" | "unknown";
export type LightMode = "normal" | "streaming";

export interface LightGet extends ServiceGet
{
	type: "light",
	/** Additional metadata including a user given name */
	metadata:
	{
		/** Human readable name of a resource */
		name: string,
		/** A fixed mired value of the white lamp */
		fixed_mired?: number,
		/** Function of the lightservice */
		function: LightFunction
	},
	/** Factory defaults of the product data */
	product_data?:
	{
		/** Name of the lightservice, only available for devices with multiple lightservices */
		name?: string,
		/** Archetype of the lightservice, only available for devices with multiple lightservices */
		archetype?: ArcheType,
		/** Function of the lightservice */
		function: LightFunction
	},
	/** Service identification number. 0 indicates service of a single instance */
	service_id: number,
	on: OnGet,
	dimming?: DimmingGet,
	dimming_delta?: object,
	color_temperature?: ColorTemperatureGet,
	color_temperature_delta?: object,
	color?: ColorGet,
	dynamics?: DynamicsGet,
	/** Basic feature containing gradient properties. */
	gradient?: GradientGet,
	effects?: EffectGet,
	effects_v2?: EffectV2Get,
	timed_effects?: TimedEffectGet,
	/** Feature containing properties to configure powerup behaviour of a lightsource. */
	powerup?: PowerupGet,
	identify?: object,
	alert?: AlertGet,
	signaling?: SignalingGet,
	mode: LightMode
}

export interface LightSet
{
	/** Additional metadata including a user given name */
	metadata?:
	{
		/** Human readable name of a resource */
		name?: string,
		/** Function of the lightservice */
		function?: LightFunction
	},
	/** Factory defaults of the product data */
	identify?:
	{
		/**
		 * Triggers a visual identification sequence, current implemented as (which can change in the future): Bridge
		 * performs Zigbee LED identification cycles for 5 seconds Lights perform one breathe cycle Sensors perform
		 * LED identification cycles for 15 seconds
		 */
		action: "identify"
	},
	on?: OnSet,
	dimming?: DimmingSet,
	dimming_delta?: DimmingDelta,
	color_temperature?: ColorTemperatureSet,
	color_temperature_delta?: ColorTemperatureDelta,
	color?: ColorSet,
	dynamics?: DynamicsSet,
	alert?: AlertSet,
	signaling?: SignalingSet,
	/** Basic feature containing gradient properties. */
	gradient?: GradientSet,
	effects?: EffectSet,
	effects_v2?: EffectV2Set,
	timed_effects?: TimedEffectSet,
	/** Feature containing properties to configure powerup behaviour of a lightsource. */
	powerup?: PowerupSet
}
