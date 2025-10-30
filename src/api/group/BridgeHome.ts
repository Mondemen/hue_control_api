import Group from ".";
import { DeviceByType, DeviceType } from "../device";
import Accessory from "../device/Accessory";
import { BridgeHomeGet } from "../types/bridge_home";
import { PartialResource, ResourceIdentifier } from "../types/resource";
import Room from "./Room";
import Zone from "./Zone";

export default class BridgeHome extends Group
{
	protected setData(data: PartialResource<BridgeHomeGet>)
	{
		super.setData(data);
		if (!this.init)
		{
			this.emit("created");
			this.init = true;
		}
		else
			this.emit("updated");
	}

	get devices()
	{return ((this.children as ResourceIdentifier<"device">[]).filter(ref => ref.rtype === "device"))}

	get rooms()
	{return ((this.children as ResourceIdentifier<"room">[]).filter(ref => ref.rtype === "room"))}

	get zones()
	{return ((this.children as ResourceIdentifier<"zone">[]).filter(ref => ref.rtype === "zone"))}

	getDevices<T extends DeviceType>(type?: T): DeviceByType[T][]
	{return (this.children.filter(child => child.rtype === "device").map(child => this.registry.resources.device.get(child.rid)).filter(child => !type || child?.deviceType === type || (type === "accessory" && child instanceof Accessory)) as DeviceByType[T][])}

	getRooms()
	{return (this.rooms.map(room => this.registry.resources.room.get(room.rid)).filter(Boolean) as Room[])}

	getZones()
	{return (this.zones.map(zone => this.registry.resources.zone.get(zone.rid)).filter(Boolean) as Zone[])}
}