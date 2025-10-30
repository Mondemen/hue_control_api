import Service, { ServiceEvents } from ".";
import { BridgeGet } from "../types/bridge";
import { PartialResource } from "../types/resource";

export interface BridgeEvent extends ServiceEvents
{
	timezone: (timezone: string) => void;
}

export default class BridgeService extends Service
{
	private bridgeID: string;
	private timezone: string;

	protected setData(data: PartialResource<BridgeGet>)
	{
		super.setData(data);
		if (data.bridge_id)
			this.bridgeID = data.bridge_id;
		if (data.time_zone && this.timezone !== data.time_zone.time_zone)
			this.emit("timezone", this.timezone = data.time_zone.time_zone);
		if (!this.init)
		{
			this.emit("created");
			this.init = true;
		}
		else
			this.emit("updated");
	}

	emit<T extends keyof BridgeEvent>(eventName: T, ...args: Parameters<BridgeEvent[T]>) {super.emit<any>(eventName, ...args)}
	on<T extends keyof BridgeEvent>(eventName: T, listener: BridgeEvent[T]) {return (super.on<any>(eventName, listener))}
	once<T extends keyof BridgeEvent>(eventName: T, listener: BridgeEvent[T]) {return (super.once<any>(eventName, listener))}
	off<T extends keyof BridgeEvent>(eventName: T, listener: BridgeEvent[T]) {super.off<any>(eventName, listener)}
	removeAllListeners<T extends keyof BridgeEvent>(eventName: T) {super.removeAllListeners<any>(eventName)}

	getBridgeID()
	{return (this.bridgeID)}

	getTimezone()
	{return (this.timezone)}
}
