export interface DimmingGet
{
	/** Brightness percentage. value cannot be 0, writing 0 changes it to lowest possible brightness */
	brightness: number,
	/** Percentage of the maximum lumen the device outputs on minimum brightness */
	min_dim_level?: number
}

export type DimmingSet = Partial<Pick<DimmingGet, "brightness">>;

export interface DimmingDelta
{
	action: "up" | "down" | "stop",
	/** Brightness percentage of full-scale increase delta to current dimlevel. Clip at Max-level or Min-level. */
	brightness_delta?: number
}