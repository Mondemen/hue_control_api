import Room from "./Room.js";
import Group from "./Group.js";
import LightService from "../service/LightService.js";
import Accessory from "../accessory/Accessory.js";
import Resource from "../Resource.js";

export default class BridgeHome extends Group
{
	_room = {};
	_accessory = {};

	constructor(bridge, data)
	{
		super(bridge, data);
	}

	_setData(data, update = false)
	{
		super._setData(data, update);
		data?.services?.forEach?.(service =>
		{
			if (!(service instanceof Resource))
				service = this._bridge?._resources?.[`${service.type ?? service.rtype}/${service.id ?? service.rid}`];
			if (service instanceof LightService)
				this._addService(service);
		})
		data?.children?.forEach?.(device =>
		{
			if (!(device instanceof Resource))
				device = this._bridge?._resources?.[`${device.type ?? device.rtype}/${device.id ?? device.rid}`];
			if (device instanceof Room)
				this._room[device.getID()] = device;
			else if (device instanceof Accessory)
				this._accessory[device.getID()] = device;
		})
	}

	_addService(service)
	{
		super._addService(service);
		if (service instanceof LightService)
			this._addDevice(service.getOwner());
	}

	addLight(light)
	{
		throw new Error(`${this.constructor.name}.addLight(): The ${this.constructor.name} cannot contain any other light`)
	}

	removeLight(light)
	{
		throw new Error(`${this.constructor.name}.removeLight(): The ${this.constructor.name} cannot remove a light `)
	}
}