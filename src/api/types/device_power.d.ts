import { ServiceGet } from "./service";

export type DevicePowerBatteryState = "normal" | "low" | "critical";

export interface DevicePowerGet extends ServiceGet
{
	type: "device_power"
	power_state:
	{
		/**
		 * * normal – battery level is sufficient
		 * * low – battery level low, some features (e.g. software update) might stop working, please change battery soon
		 * * critical – battery level critical, device can fail any moment
		 */
		battery_state?: DevicePowerBatteryState,
		/** The current battery state in percent, only for battery powered devices. */
		battery_level?: number
	}
}