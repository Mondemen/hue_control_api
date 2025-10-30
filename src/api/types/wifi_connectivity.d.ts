import { ServiceGet } from "./service";

export type WifiConnectivityStatus = "connected" | "disconnected";

export interface WifiConnectivityGet extends ServiceGet
{
	type: "wifi_connectivity",
	/**
	 * * Connected if device has been recently been available.
	 * * When indicating connectivity issues the device is powered off or has network issues
	 * * When indicating unidirectional incoming the device only talks to bridge
	 */
	status: WifiConnectivityStatus,
	has_ssid: boolean
}
