import { SensorGet } from "./sensor";

export interface TemperatureGet extends SensorGet
{
	type: "temperature",
	temperature:
	{
		/**
		 * Temperature in 1.00 degrees Celsius
		 * @deprecated
		 */
		temperature: number,
		/**
		 * Indication whether the value presented in temperature is valid
		 * @deprecated
		 */
		temperature_valid: boolean,
		temperature_report?:
		{
			/** Last time the value of this property is changed. */
			changed: Date,
			/** Temperature in 1.00 degrees Celsius */
			temperature: number
		}
	}
}
