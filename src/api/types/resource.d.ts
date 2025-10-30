import { UUID } from "crypto";
import { ResourceGet } from "./resource";

export type ResourceType =
	| "auth_v1"
	| "behavior_instance"
	| "behavior_script"
	| "bell_button"
	| "bridge_home"
	| "bridge"
	| "button"
	| "camera_motion"
	| "clip"
	| "contact"
	| "convenience_area_motion"
	| "device_power"
	| "device_software_update"
	| "device"
	| "entertainment_configuration"
	| "entertainment"
	| "geofence_client"
	| "geofence"
	| "geolocation"
	| "grouped_light_level"
	| "grouped_light"
	| "grouped_motion"
	| "homekit"
	| "light_level"
	| "light"
	| "matter_fabric"
	| "matter"
	| "motion_area_candidate"
	| "motion_area_configuration"
	| "motion"
	| "public_image"
	| "relative_rotary"
	| "remote_access"
	| "room"
	| "scene"
	| "security_area_motion"
	| "service_group"
	| "smart_scene"
	| "system_update"
	| "speaker"
	| "tamper"
	| "temperature"
	| "wifi_connectivity"
	| "zgp_connectivity"
	| "zigbee_connectivity"
	| "zigbee_device_discovery"
	| "zone";

export type ArcheType =
	| "bollard"
	| "bridge_v2"
	| "bridge_v3"
	| "candle_bulb"
	| "ceiling_horizontal"
	| "ceiling_round"
	| "ceiling_square"
	| "ceiling_tube"
	| "christmas_tree"
	| "classic_bulb"
	| "double_spot"
	| "edison_bulb"
	| "ellipse_bulb"
	| "flexible_lamp"
	| "flood_bulb"
	| "floor_lantern"
	| "floor_shade"
	| "ground_spot"
	| "hue_bloom"
	| "hue_centris"
	| "hue_chime"
	| "hue_floodlight_camera"
	| "hue_go"
	| "hue_iris"
	| "hue_lightstrip"
	| "hue_lightstrip_pc"
	| "hue_lightstrip_tv"
	| "hue_neon"
	| "hue_omniglow"
	| "hue_play"
	| "hue_play_wallwasher"
	| "hue_signe"
	| "hue_tube"
	| "large_globe_bulb"
	| "luster_bulb"
	| "pendant_long"
	| "pendant_round"
	| "pendant_spot"
	| "plug"
	| "recessed_ceiling"
	| "recessed_floor"
	| "single_spot"
	| "small_globe_bulb"
	| "spot_bulb"
	| "string_globe"
	| "string_light"
	| "string_permanent"
	| "sultan_bulb"
	| "table_shade"
	| "table_wash"
	| "triangle_bulb"
	| "twilight"
	| "twilight_back"
	| "twilight_front"
	| "unknown_archetype"
	| "up_and_down"
	| "up_and_down_down"
	| "up_and_down_up"
	| "vintage_bulb"
	| "vintage_candle_bulb"
	| "wall_lantern"
	| "wall_shade"
	| "wall_spot"
	| "wall_washer"
	| "unknown_archetype";

export interface ResourceIdentifier<T extends ResourceType = ResourceType>
{
	rid: UUID,
	rtype: T
}

export interface ResourceGet
{
	/** Unique identifier representing a specific resource instance */
	id: UUID,
	/** Clip v1 resource identifier */
	id_v1?: string,
	/** Type of the supported resources */
	type: ResourceType
}

export interface ResourcesResponseGet
{
	errors:
	{
		/** A human-readable explanation specific to this occurrence of the problem. */
		description: string
	}[],
	data: ResourceGet[]
}

export interface ResourcesResponseSet
{
	errors:
	{
		/** A human-readable explanation specific to this occurrence of the problem. */
		description: string
	}[],
	data: ResourceIdentifier[]
}

export interface ResourceEvent
{
	id: string;
	data: {
		id: UUID;
		type: "add" | "update" | "delete";
		creationtime: Date;
		data: ResourceGet[];
	}[];
}

export type PartialResource<T> = Partial<T> & ResourceGet;
