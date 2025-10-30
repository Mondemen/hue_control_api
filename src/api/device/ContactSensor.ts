import { DeviceType } from ".";
import { DeviceGet } from "../types/device";
import { PartialResource } from "../types/resource";
import Accessory from "./Accessory";

export default class ContactSensor extends Accessory
{
	deviceType: DeviceType = "contact_sensor";

	static is(resource: DeviceGet)
	{
		return (resource.services.find(service => service.rtype === "contact"));
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
