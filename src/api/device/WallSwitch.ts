import { DeviceType } from ".";
import { DeviceGet } from "../types/device";
import { PartialResource } from "../types/resource";
import Accessory from "./Accessory";

export default class WallSwitch extends Accessory
{
	deviceType: DeviceType = "wall_switch";

	static is(resource: DeviceGet)
	{
		return (resource.services.find(service => service.rtype === "button") && resource.device_mode);
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
