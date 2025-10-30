import { SensorGet } from "./sensor";

export interface GroupedMotionGet extends SensorGet
{
	type: "grouped_motion",
	motion:
	{
		/**
		 * true if motion is detected
		 * @deprecated
		 */
		motion: boolean,
		/**
		 * Motion is valid when motion_report property is present, invalid when absent.
		 * @deprecated
		 */
		motion_valid: boolean,
		motion_report?:
		{
			/** Last time the value of this property is changed. */
			changed: Date,
			/** true if motion is detected */
			motion: boolean
		}
	}
}
