import { UUID } from "crypto";
import Device, { DeviceByType, DeviceType } from ".";
import ExtError from "../../lib/error";
import { DeviceGet } from "../types/device";
import { PartialResource, ResourceIdentifier } from "../types/resource";
import EntertainmentConfiguration from "../EntertainmentConfiguration";

export default class Bridge extends Device
{
	deviceType: DeviceType = "bridge";

	static is(resource: DeviceGet)
	{
		const services = resource.services;

		return (services.find(service => service.rtype === "bridge") && services.find(service => service.rtype === "zigbee_device_discovery"));
	}

	protected setData(data: PartialResource<DeviceGet>)
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

	get bridgeService()
	{
		const bridge = this.services.find(ref => ref.rtype === "bridge") as ResourceIdentifier<"bridge"> | undefined;

		if (bridge)
			return (bridge);
		throw new ExtError("Bridge service ref not found");
	}

	get bridgeHome(): ResourceIdentifier<"bridge">
	{return ({rid: this.getBridgeHome().getID(), rtype: "bridge"})}

	getBridgeService()
	{
		const bridge = this.registry.resources.bridge.get(this.bridgeService.rid);

		if (bridge)
			return (bridge);
		throw new ExtError("Bridge service not found");
	}

	getBridgeHome()
	{
		for (const [, bridgeHome] of this.registry.resources.bridge_home)
		{
			for (const device of bridgeHome.devices)
				if (device.rid === this.id)
					return (bridgeHome);
			for (const room of bridgeHome.getRooms())
				for (const device of room.children)
					if (device.rid === this.id)
						return (bridgeHome);
		}
		throw new ExtError("BridgeHome service not found");
	}

	getBridgeID()
	{return (this.getBridgeService().getBridgeID())}

	getTimezone()
	{return (this.getBridgeService().getTimezone())}

	getUnassignedDevices<T extends DeviceType = "device">(type: T = "device" as T): DeviceByType[T][]
	{return (this.getBridgeHome().getDevices(type))}

	getDevices<T extends DeviceType>(type?: T): DeviceByType[T][]
	{
		const devices = new Set<DeviceByType[T]>();

		for (const device of this.getUnassignedDevices(type))
				devices.add(device);
		for (const room of this.getRooms())
			for (const device of room.getDevices(type))
					devices.add(device);
		return (Array.from(devices));
	}

	getEntertainmentConfigurations()
	{
		const list = new Map<UUID, EntertainmentConfiguration>();

		this.getDevices("light").forEach(light => light.getEntertainment()?.getConfigurations()?.forEach(config => list.set(config.getID(), config)));
		return (list.array());
	}

	getRooms()
	{return (this.getBridgeHome().getRooms())}

	getZones()
	{return (this.getBridgeHome().getZones())}
}
