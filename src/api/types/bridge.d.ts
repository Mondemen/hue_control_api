import { ServiceGet } from "./service";

export interface BridgeGet extends ServiceGet
{
	type: "bridge",
	/** Unique identifier of the bridge as printed on the device. Lower case (shouldn't it be upper case?) */
	bridge_id: string,
	time_zone:
	{
		/** Time zone where the user's home is located (as Olson ID). */
		time_zone: string
	}
}