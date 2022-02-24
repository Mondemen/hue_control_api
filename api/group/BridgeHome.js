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
		// console.log(data.children.map(child => child._id + " " + child.constructor.name));
		super._setData(data, update);
		data?.children?.forEach?.(device =>
		{
			if (!(device instanceof Resource))
				device = this._bridge?._resources?.all?.[`${device.type ?? device.rtype}/${device.id ?? device.rid}`];
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
		{
			service = service.getOwner();
			this._light[service.getID()] = service;
		}
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