import Service, { ServiceEvents } from ".";
import { SensorGet, SensorSet } from "../types/sensor";
import { PartialResource } from "../types/resource";

export interface SensorServiceEvents extends ServiceEvents
{
	enabled: (state: boolean) => void
}

export default class SensorService extends Service
{
	declare protected toUpdate: SensorSet;

	private enabled: boolean;

	protected setData(data: PartialResource<SensorGet>)
	{
		super.setData(data);
		if (typeof data.enabled === "boolean" && this.enabled !== data.enabled)
			this.emit("enabled", this.enabled = data.enabled);
	}

	emit<T extends keyof SensorServiceEvents>(eventName: T, ...args: Parameters<SensorServiceEvents[T]>) {super.emit<any>(eventName, ...args)}
	on<T extends keyof SensorServiceEvents>(eventName: T, listener: SensorServiceEvents[T]) {return (super.on<any>(eventName, listener))}
	once<T extends keyof SensorServiceEvents>(eventName: T, listener: SensorServiceEvents[T]) {return (super.once<any>(eventName, listener))}
	off<T extends keyof SensorServiceEvents>(eventName: T, listener: SensorServiceEvents[T]) {super.off<any>(eventName, listener)}
	removeAllListeners<T extends keyof SensorServiceEvents>(eventName: T) {super.removeAllListeners<any>(eventName)}

	isEnabled()
	{return (this.toUpdate.enabled ?? this.enabled)}

	setEnabled(enabled: boolean)
	{
		this.toUpdate.enabled = enabled;
		this.updatable = true;
		return (this);
	}
}