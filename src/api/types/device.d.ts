import { ArcheType, ResourceGet, ResourceIdentifier } from "./resource";

export type DeviceModeType = "switch_single_rocker" | "switch_single_pushbutton" | "switch_dual_rocker" | "switch_dual_pushbutton";

export interface DeviceGet extends ResourceGet
{
	type: "device",
	product_data?:
	{
		/** Unique identification of device model */
		model_id: string,
		/** Name of device manufacturer */
		manufacturer_name: string,
		/** Name of the product. */
		product_name: string,
		/** Archetype of the product */
		product_archetype: ArcheType,
		/** This device is Hue certified */
		certified: boolean,
		/** Software version of the product */
		software_version: string,
		/** Hardware type; identified by Manufacturer code and ImageType */
		hardware_platform_type: string
	},
	metadata:
	{
		/** Human readable name of a resource */
		name: string,
		/** By default archetype given by manufacturer. Can be changed by user. */
		archetype: ArcheType,
	},
	usertest?:
	{
		status: "set" | "changing",
		/**
		 * Activates or extends user usertest mode of device for 120 seconds. false deactivates usertest mode.
		 * In usertest mode, devices report changes in state faster and indicate state changes on device LED (if applicable)
		 */
		usertest: boolean
	},
	device_mode?:
	{
		status: "set" | "changing",
		/** Current mode (on read) or requested mode (on write) of the device */
		mode: DeviceModeType,
		/** The modes that the device supports */
		mode_values: DeviceModeType[]
	},
	services: ResourceIdentifier[]
}

export interface DeviceSet
{
	metadata?: Partial<DeviceGet["metadata"]>,
	identify?:
	{
		/**
		 * Triggers a visual identification sequence, current implemented as (which can change in the future): Bridge
		 * performs Zigbee LED identification cycles for 5 seconds Lights perform one breathe cycle Sensors perform
		 * LED identification cycles for 15 seconds
		 */
		action: "identify"
	},
	usertest?:
	{
		/**
		 * Activates or extends user usertest mode of device for 120 seconds. false deactivates usertest mode.
		 * In usertest mode, devices report changes in state faster and indicate state changes on device LED (if applicable)
		 */
		usertest?: boolean
	},
	device_mode?: Pick<DeviceGet["device_mode"] & {}, "mode">
}