import { EffectType } from "./effect_v2"

export interface EffectGet
{
	/** Current status values the light is in regarding effects */
	status: EffectType,
	/** Possible status values in which a light could be when playing an effect. */
	status_values: EffectType[],
	/** Possible effect values you can set in a light. */
	effect_values: EffectType[]
}

export interface EffectSet
{
	effect?: EffectType
}
