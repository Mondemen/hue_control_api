import { ServiceGet } from "./service";

export type ZigbeeConnectivityStatus = "connected" | "disconnected" | "connectivity_issue" | "unidirectional_incoming";
export type ZigbeeConnectivityChannelStatus = "set" | "changing";
export type ZigbeeConnectivityChannel = "channel_11" | "channel_15" | "channel_20" | "channel_25" | "not_configured";

export interface ZigbeeConnectivityGet extends ServiceGet
{
	type: "zigbee_connectivity",
	/**
	 * * Connected if device has been recently been available.
	 * * When indicating connectivity issues the device is powered off or has network issues.
	 * * When indicating unidirectional incoming the device only talks to bridge
	 */
	status: ZigbeeConnectivityStatus,
	mac_address: string,
	channel?:
	{
		status: ZigbeeConnectivityChannelStatus,
		/** Current value of the zigbee channel. If recently changed, the value will reflect the channel that is currently being changed to. */
		value?: ZigbeeConnectivityChannel
	},
	/** Extended pan id of the zigbee network. */
	extended_pan_id?: string
}

export interface ZigbeeConnectivitySet
{
	channel?: Pick<ZigbeeConnectivityGet["channel"] & {}, "value">
}
