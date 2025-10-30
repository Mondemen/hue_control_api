import { DeviceType } from ".";
import { DeviceGet } from "../types/device";
import { PartialResource } from "../types/resource";
import Accessory from "./Accessory";

export default class MotionSensor extends Accessory
{
	deviceType: DeviceType = "motion_sensor";

	static is(resource: DeviceGet)
	{
		return (resource.services.find(service => service.rtype === "motion"));
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
