import { DeviceType } from ".";
import { DeviceGet } from "../types/device";
import { PartialResource } from "../types/resource";
import Accessory from "./Accessory";

export default class DialSwitch extends Accessory
{
	deviceType: DeviceType = "dial_switch";

	static is(resource: DeviceGet)
	{
		const services = resource.services;

		return (services.filter(service => service.rtype === "button").length === 4 && services.find(service => service.rtype === "relative_rotary"));
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
}
