import { ColorSet } from "./color";
import { ColorTemperatureSet } from "./color_temperature";
import { DimmingSet } from "./dimming";
import { EffectSet } from "./effect";
import { EffectV2Set } from "./effect_v2";

export interface PaletteGet
{
	color:
	{
		color: Required<ColorSet>,
		dimming: Required<DimmingSet>
	}[],
	dimming: Required<DimmingSet>[],
	color_temperature:
	{
		color_temperature: Required<ColorTemperatureSet>,
		dimming: Required<DimmingSet>
	}[],
	effects?: Required<EffectSet>[],
	effects_v2?: Required<EffectV2Set>[]
}

export type PaletteSet = Omit<PaletteGet, "effects" | "effect_v2"> & Partial<Pick<PaletteGet, "effects" | "effects_v2">>;
