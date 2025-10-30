import Device from ".";
import { ResourceIdentifier } from "../types/resource";

export default abstract class Accessory extends Device
{
	get devicePowerService()
	{return (this.services.find(ref => ref.rtype === "device_power") as ResourceIdentifier<"device_power"> | undefined)}

	getDevicePowerService()
	{
		const devicePowerService = this.devicePowerService;

		return (devicePowerService && this.registry.resources.device_power.get(devicePowerService.rid));
	}

	getBatteryState()
	{return (this.getDevicePowerService()?.getBatteryState())}

	getBatteryLevel()
	{return (this.getDevicePowerService()?.getBatteryLevel())}
}
