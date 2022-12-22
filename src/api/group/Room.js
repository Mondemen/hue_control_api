import { checkParam } from "../../utils/index.js";
import Device from "../Device.js";
import Resource from "../Resource.js";
import LightService from "../service/LightService.js";
import Group from "./Group.js";

export default class Room extends Group
{
	constructor(bridge, data)
	{
		super(bridge, data);
	}

	_setData(data)
	{
		super._setData(data);
		data?.children?.forEach(child =>
		{
			if (!(child instanceof Resource))
				child = this._bridge?._resources?.[`${child.type ?? child.rtype}/${child.id ?? child.rid}`];
			if (child instanceof Resource)
				this._addService(child);
		});
	}

	_addService(service)
	{
		super._addService(service);
		if (service instanceof LightService)
		{
			service = service.getOwner();
			service?.setRoom?.(this);
			this._addDevice(service);
		}
		else if (service instanceof Device)
		{
			service?._setRoom?.(this);
			this._addDevice(service);
		}
	}

	addDevice(device)
	{
		checkParam(this, "addDevice", "device", device, Device);
		if (device?.getRoom?.()?.getName?.())
			throw new Error(`The device '${device.getName()}' is already in a room`);
		return (super.addDevice(device));
	}
}