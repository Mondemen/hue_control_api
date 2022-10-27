import Light from "../light/Light.js";
import Resource from "../Resource.js";
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
		super._setData(data, update);
		data?.children?.forEach?.(light =>
		{
			if (!(light instanceof Resource))
				light = this._bridge?._resources?.[`${light.type ?? light.rtype}/${light.id ?? light.rid}`];
			if (light instanceof Resource)
				this._addService(light);
		})
	}

	_addService(service)
	{
		super._addService(service);
		if (service instanceof LightService)
		{
			service = service.getOwner();
			service?.addZone?.(this);
			this._addDevice(service);
		}
	}

	addLight(light)
	{
		checkParam(this, "addLight", "light", light, Light);
		super.addDevice(light);
	}

	removeLight(light)
	{
		checkParam(this, "removeLight", "light", light, Light);
		super.removeDevice(light);
	}

	getLights()
	{return (this.getDevices())}

	getLight(id)
	{return (this.getDevice(id))}
}
