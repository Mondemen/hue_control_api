import { DeviceType } from ".";
import { DeviceGet } from "../types/device";
import { PartialResource } from "../types/resource";
import Accessory from "./Accessory";

export default class SmartButton extends Accessory
{
	deviceType: DeviceType = "smart_button";

	static is(resource: DeviceGet)
	{
		return (resource.services.filter(service => service.rtype === "button").length === 1);
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
