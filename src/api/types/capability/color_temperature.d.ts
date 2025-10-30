export interface ColorTemperatureGet
{
	/** Color temperature in mirek or null when the light color is not in the ct spectrum */
	mirek: number,
	/** Indication whether the value presented in mirek is valid */
	mirek_valid: boolean,
	mirek_schema:
	{
		/** Minimum color temperature this light supports */
		mirek_minimum: number,
		/** Maximum color temperature this light supports */
		mirek_maximum: number
	}
}

export type ColorTemperatureSet = Partial<Pick<ColorTemperatureGet, "mirek">>;

export interface ColorTemperatureDelta
{
	action: "up" | "down" | "stop",
	/** Mirek delta to current mirek. Clip at mirek_minimum and mirek_maximum of mirek_schema. */
	mirek_delta?: number
}