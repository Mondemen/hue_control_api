import { ServiceGet } from "./service";
import { ZigbeeConnectivityStatus } from "./zigbee_connectivity";

export type ZgpConnectivityStatus = ZigbeeConnectivityStatus;

export interface ZgpConnectivityGet extends ServiceGet
{
	type: "zgp_connectivity",
	/**
	 * * Connected if device has been recently been available.
	 * * When indicating connectivity issues the device is powered off or has network issues
	 * * When indicating unidirectional incoming the device only talks to bridge
	 */
	status: ZgpConnectivityStatus,
	source_id: string,
	/** Timestamp of the last channel change confirmation */
	channel_confirmed: Date
}
