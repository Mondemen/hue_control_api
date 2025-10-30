import { ServiceGet } from "./service"

export interface SensorGet extends ServiceGet
{
	/** true when sensor is activated, false when deactivated */
	enabled: boolean
}

export interface SensorSet
{
	/** true when sensor is activated, false when deactivated */
	enabled?: boolean
}