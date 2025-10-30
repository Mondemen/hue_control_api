export type TimedEffectType = "no_effect" | "sunrise" | "sunset";

export interface TimedEffectGet
{
	/** Current status values the light is in regarding timed effects */
	status: TimedEffectType,
	/** Possible status values in which a light could be when playing a timed effect. */
	status_values: TimedEffectType[],
	/** Possible timed effect values you can set in a light. */
	effect_values: TimedEffectType[]
}

export interface TimedEffectSet
{
	status?: TimedEffectType,
	/**
	 * Duration is mandatory when timed effect is set except for no_effect.
	 * Resolution decreases for a larger duration. e.g Effects with duration smaller than a minute
	 * will be rounded to a resolution of 1s, while effects with duration larger than an hour will
	 * be arounded up to a resolution of 300s. Duration has a max of 21600000 ms.
	 */
	duration?: number
}
