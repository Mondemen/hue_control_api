export type SignalType = "no_signal" | "on_off" | "on_off_color" | "alternating";

export interface SignalingGet
{
	/** Signals that the light supports. */
	signal_values: SignalType[],
	/** Indicates status of active signal. Not available when inactive. */
	status?:
	{
		/** Indicates which signal is currently active. */
		signal: SignalType,
		/** Timestamp indicating when the active signal is expected to end. Value is not set if there is no_signal */
		estimated_end?: Date,
		/** Colors that were provided for the active effect. */
		colors:
		{
			/** CIE XY gamut position */
			xy:
			{
				/** X position in color gamut */
				x: number,
				/** Y position in color gamut */
				y: number
			}
		}[]
	}
}

export interface SignalingSet
{
	/**
	 * "no_signal": No signal is active. Write "no_signal" to stop active signal.
	 *
	 * "on_off": Toggles between max brightness and Off in fixed color.
	 *
	 * "on_off_color": Toggles between off and max brightness with color provided.
	 *
	 * "alternating": Alternates between 2 provided colors.
	 */
	signal: SignalType,
	/** Duration has a max of 65534000 ms and a stepsize of 1 second. Values inbetween steps will be rounded. Duration is ignored for no_signal. */
	duration: number,
	/** List of colors to apply to the signal (not supported by all signals) */
	colors?:
	{
		/** CIE XY gamut position */
		xy:
		{
			/** X position in color gamut */
			x: number,
			/** Y position in color gamut */
			y: number
		}
	}[]

}