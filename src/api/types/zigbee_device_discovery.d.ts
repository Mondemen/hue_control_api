import { ServiceGet } from "./service";

export type ZigbeeDeviceDiscoveryStatus = "active" | "ready";
export type SearchActionType = "search" | "search_allow_default_link_key";

export interface ZigbeeDeviceDiscoveryGet extends ServiceGet
{
	type: "zigbee_device_discovery",
	status: ZigbeeDeviceDiscoveryStatus,
	action:
	{
		action_type_values: SearchActionType[],
		search_codes?: string[]
	}
}

export interface ZigbeeDeviceDiscoverySet
{
	action:
	{
		action_type: SearchActionType,
		search_codes?: string[]
	},
	add_install_codes?:
	{
		install_codes?:
		{
			mac_address: string,
			ic: string
		}
	}
}