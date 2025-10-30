export type GradientMode = "interpolated_palette" | "interpolated_palette_mirrored" | "random_pixelated";

export interface GradientGet
{
	/** Collection of gradients points. For control of the gradient points through a PUT a minimum of 2 points need to be provided. */
	points:
	{
		color:
		{
			/** CIE XY gamut position */
			xy:
			{
				/** X position in color gamut */
				x: number,
				/** Y position in color gamut */
				y: number
			}
		}
	}[],
	/** Mode in which the points are currently being deployed. If not provided during PUT/POST it will be defaulted to interpolated_palette */
	mode: GradientMode,
	/** Modes a gradient device can deploy the gradient palette of colors */
	mode_values: GradientMode[],
	/** Number of color points that gradient lamp is capable of showing with gradience. */
	points_capable: number,
	/** Number of pixels in the device */
	pixel_count?: number
}

export type GradientSet = Pick<GradientGet, "points"> & Partial<Pick<GradientGet, "mode">>;
