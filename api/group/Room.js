import LightService from "../service/LightService.js";
import Group from "./Group.js";

export default class Room extends Group
{
	constructor(bridge, data)
	{
		super(bridge, data);
	}

	convertOldData(id, data, services)
	{
		let result = super.convertOldData(id, data, services);
		let resource;

		result.children = result.children.map(child =>
		{
			resource = this._bridge?._resources?.all?.[`${child.rtype}/${child.rid}`];
			if (resource && resource.getOwner())
				return ({rid: resource.getOwner().getID(), rtype: resource.getOwner().getType()})
			return (child);
		})
		return (result);
	}
	_setData(data, update = false)
	{
		Object.values(this._light ?? {}).forEach(light => light.setRoom(undefined));
		this._light = {};
		super._setData(data, update);
	}

	_addService(service)
	{
		super._addService(service);
		if (service instanceof LightService)
		{
			service = service.getOwner();
			service?.setRoom?.(this);
			this._light[service.getID()] = service;
		}
	}

	addLight(light)
	{
		if (light?.getRoom?.()?.getName?.())
			throw new Error(`The device '${light.getName()}' is already in a room`);
		super.addLight(light);
	}
}