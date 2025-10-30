import Service, { ServiceEvents } from ".";
import { DevicePowerBatteryState, DevicePowerGet } from "../types/device_power";
import { PartialResource } from "../types/resource";

export interface DevicePowerServiceEvents extends ServiceEvents
{
	battery_state: (state: DevicePowerBatteryState) => void;
	battery_level: (level: number) => void;
}

export default class DevicePowerService extends Service
{
	private batteryState: DevicePowerBatteryState;
	private batteryLevel: number;

	protected setData(data: PartialResource<DevicePowerGet>)
	{
		super.setData(data);
		if (data.power_state && data.power_state.battery_state)
			this.emit("battery_state", this.batteryState = data.power_state.battery_state);
		if (data.power_state && data.power_state.battery_level)
			this.emit("battery_level", this.batteryLevel = data.power_state.battery_level);
		if (!this.init)
		{
			this.emit("created");
			this.init = true;
		}
		else
			this.emit("updated");
	}

	emit<T extends keyof DevicePowerServiceEvents>(eventName: T, ...args: Parameters<DevicePowerServiceEvents[T]>) {super.emit<any>(eventName, ...args)}
	on<T extends keyof DevicePowerServiceEvents>(eventName: T, listener: DevicePowerServiceEvents[T]) {return (super.on<any>(eventName, listener))}
	once<T extends keyof DevicePowerServiceEvents>(eventName: T, listener: DevicePowerServiceEvents[T]) {return (super.once<any>(eventName, listener))}
	off<T extends keyof DevicePowerServiceEvents>(eventName: T, listener: DevicePowerServiceEvents[T]) {super.off<any>(eventName, listener)}
	removeAllListeners<T extends keyof DevicePowerServiceEvents>(eventName: T) {super.removeAllListeners<any>(eventName)}

	getBatteryState()
	{return (this.batteryState)}

	getBatteryLevel()
	{return (this.batteryLevel)}
}