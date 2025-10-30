import { SensorGet } from "./sensor";

export interface GroupedLightLevelGet extends SensorGet
{
	type: "grouped_light_level",
	light:
	{
		/**
		 * Light level in 10000*log10(lux) +1 measured by sensor. Logarithmic scale used because the human
		 * eye adjusts to light levels and small changes at low lux levels are more noticeable than at high
		 * lux levels. This allows use of linear scale configuration sliders.
		 * @deprecated
		 */
		light_level: number,
		/**
		 * Indication whether the value presented in light_level is valid
		 * @deprecated
		 */
		light_level_valid: boolean,
		light_level_report?:
		{
			/** Last time the value of this property is changed. */
			changed: Date,
			/**
			 * Light level in 10000*log10(lux) +1 measured by sensor. Logarithmic scale used because the human
			 * eye adjusts to light levels and small changes at low lux levels are more noticeable than at high
			 * lux levels. This allows use of linear scale configuration sliders.
			 */
			light_level: number
		}
	}
}
