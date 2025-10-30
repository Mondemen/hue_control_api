import { number, object, ObjectSchema, string } from "yup";
import { ResourceIdentifier, ResourceType } from "../types/resource";
import { UUID } from "crypto";
import { ColorSet } from "../types/capability/color";

export function resourceIdentifier<T extends ResourceType>(type?: T[]): ObjectSchema<ResourceIdentifier<T>>
{
	return (object(
	{
		rid: string<UUID>().uuid().required(),
		rtype: string().oneOf<T>(type ?? ["auth_v1", "behavior_instance", "behavior_script", "bell_button", "bridge_home", "bridge", "button", "camera_motion", "clip", "contact", "convenience_area_motion", "device_power", "device_software_update", "device", "entertainment_configuration", "entertainment", "geofence_client", "geofence", "geolocation", "grouped_light_level", "grouped_light", "grouped_motion", "homekit", "light_level", "light", "matter_fabric", "matter", "motion_area_candidate", "motion_area_configuration", "motion", "public_image", "relative_rotary", "remote_access", "room", "scene", "security_area_motion", "service_group", "smart_scene", "system_update", "speaker", "tamper", "temperature", "wifi_connectivity", "zgp_connectivity", "zigbee_connectivity", "zigbee_device_discovery", "zone"] as T[]).required()
	}) as any);
}

export const colorCreate: ObjectSchema<Required<ColorSet>> = object(
{
	xy: object(
	{
		x: number().min(0).max(1).required(),
		y: number().min(0).max(1).required()
	}).required()
});
