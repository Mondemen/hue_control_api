import LightService from "../service/LightService.js";
import Group from "./Group.js";

export default class Zone extends Group
{
	constructor(bridge, data)
	{
		super(bridge, data);
	}

	_setData(data, update = false)
	{
		Object.values(this._light ?? {}).forEach(light => light.removeZone(this));
		this._light = {};
		super._setData(data, update);
		// data?.children?.forEach?.(light =>
		// {
		// 	if (!(light instanceof Resource))
		// 		light = this._bridge?._resources?.all?.[`${light.type ?? light.rtype}/${light.id ?? light.rid}`];
		// 	if (light instanceof LightService)
		// 	{
		// 		light = light.getOwner();
		// 		light?.addZone?.(this);
		// 		this._light[light.getID()] = light;
		// 	}
		// })
	}

	_addService(service)
	{
		super._addService(service);
		if (service instanceof LightService)
		{
			service = service.getOwner();
			service?.addZone?.(this);
			this._light[service.getID()] = service;
		}
	}
}
