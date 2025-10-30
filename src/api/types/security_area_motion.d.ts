import { SensorGet, type SensorSet } from "./sensor";

export type SecurityAreaMotionSensitivityStatus = "set" | "changing";

export interface SecurityAreaMotionGet extends SensorGet
{
	type: "security_area_motion",
	motion:
	{
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
		status: SecurityAreaMotionSensitivityStatus,
		/** Sensitivity of the sensor. Value in the range 0 to sensitivity_max. */
		sensitivity: number,
		/** Maximum value of the sensitivity configuration attribute. */
		sensitivity_max?: number,
	}
}

export interface SecurityAreaMotionSet extends SensorSet
{
	sensitivity?:
	{
		/** Sensitivity of the sensor. Value in the range 0 to sensitivity_max. */
		sensitivity?: number
	}
}
