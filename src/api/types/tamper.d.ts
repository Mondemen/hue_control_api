import { SensorGet } from "./sensor";

export type TamperSource = "battery_door";
export type TamperState = "tampered" | "not_tampered";

export interface TamperReport
{
	/** Last time the value of this property is changed. */
	changed: Date,
	/** Source of tamper and time expired since last change of tamper-state. */
	source: TamperSource,
	/** tampered and not_tampered are the state of tamper after last change of tamper_state. */
	state: TamperState
}

export interface TamperGet extends SensorGet
{
	type: "tamper",
	tamper_reports: TamperReport[]
}
