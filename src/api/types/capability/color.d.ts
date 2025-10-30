export interface ColorGamut
{
	/** CIE XY gamut position */
	red:
	{
		/** X position in color gamut */
		x: number,
		/** Y position in color gamut */
		y: number
	},
	/** CIE XY gamut position */
	green:
	{
		/** X position in color gamut */
		x: number,
		/** Y position in color gamut */
		y: number
	},
	/** CIE XY gamut position */
	blue:
	{
		/** X position in color gamut */
		x: number,
		/** Y position in color gamut */
		y: number
	}
}

export type ColorGamutType = "A" | "B" | "C" | "other";

export interface ColorGet
{
	/** CIE XY gamut position */
	xy:
	{
		/** X position in color gamut */
		x: number,
		/** Y position in color gamut */
		y: number
	},
	/** Color gamut of color bulb. Some bulbs do not properly return the Gamut information. In this case this is not present. */
	gamut?: ColorGamut,
	/**
	 * The gammut types supported by hue – A Gamut of early Philips color-only products –
	 * B Limited gamut of first Hue color products – C Richer color gamut of Hue white and
	 * color ambiance products – other Color gamut of non-hue products with non-hue gamuts resp w/o gamut
	 */
	gamut_type: ColorGamutType
}

export type ColorSet = Partial<Pick<ColorGet, "xy">>;
