import { SensorSet } from "./sensor";

export type CameraMotionSensitivityStatus = "set" | "changing";

export interface CameraMotionGet extends SensorSet
{
	type: "camera_motion",
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
	},
	sensitivity?:
	{
		status: CameraMotionSensitivityStatus,
		/** Sensitivity of the sensor. Value in the range 0 to sensitivity_max. */
		sensitivity: number,
		/** Maximum value of the sensitivity configuration attribute. */
		sensitivity_max?: number
	}
}

export interface CameraMotionSet extends SensorSet
{
	sensitivity?:
	{
		/** Sensitivity of the sensor. Value in the range 0 to sensitivity_max. */
		sensitivity?: number
	}
}