export type EffectType = "no_effect" | "candle" | "fire" | "prism" | "sparkle" | "opal" | "glisten" | "underwater" | "cosmos" | "sunbeam" | "enchant";

export interface EffectV2Get
{
	action:
	{
		/** Possible effect values you can set in a light. */
		effect_values: EffectType[]
	},
	status:
	{
		/** Current status values the light is in regarding effects */
		effect: EffectType,
		/** Possible status values in which a light could be when playing an effect. */
		effect_values: EffectType[],
		parameters:
		{
			color?:
			{
				/** CIE XY gamut position */
				xy:
				{
					/** X position in color gamut */
					x: number,
					/** Y position in color gamut */
					y: number
				}
			},
			color_temperature?:
			{
				mirek: number,
				mirek_valid: boolean
			},
			speed: number
		}
	}


}

export interface EffectV2Set
{
	action?:
	{
		effect: EffectType,
		parameters?: Partial<Omit<EffectV2Get["status"]["parameters"], "color_temperature"> & { color_temperature: Pick<EffectV2Get["status"]["parameters"]["color_temperature"] & {}, "mirek">}>
	}
}
