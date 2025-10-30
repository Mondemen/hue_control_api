import Service, { ServiceEvents } from ".";
import { PartialResource } from "../types/resource";
import { WifiConnectivityGet, WifiConnectivityStatus } from "../types/wifi_connectivity";

export interface WifiConnectivityServiceEvents extends ServiceEvents
{
	connectivity_status: (state: any) => void;
}

export default class WifiConnectivityService extends Service
{
	private status: WifiConnectivityStatus;
	private ssid: boolean;

	protected setData(data: PartialResource<WifiConnectivityGet>)
	{
		super.setData(data);
		if (data.status)
			this.emit("connectivity_status", this.status = data.status);
		if (typeof data.has_ssid === "boolean")
			this.ssid = data.has_ssid;
		if (!this.init)
		{
			this.emit("created");
			this.init = true;
		}
		else
			this.emit("updated");
	}

	emit<T extends keyof WifiConnectivityServiceEvents>(eventName: T, ...args: Parameters<WifiConnectivityServiceEvents[T]>) {super.emit<any>(eventName, ...args)}
	on<T extends keyof WifiConnectivityServiceEvents>(eventName: T, listener: WifiConnectivityServiceEvents[T]) {return (super.on<any>(eventName, listener))}
	once<T extends keyof WifiConnectivityServiceEvents>(eventName: T, listener: WifiConnectivityServiceEvents[T]) {return (super.once<any>(eventName, listener))}
	off<T extends keyof WifiConnectivityServiceEvents>(eventName: T, listener: WifiConnectivityServiceEvents[T]) {super.off<any>(eventName, listener)}
	removeAllListeners<T extends keyof WifiConnectivityServiceEvents>(eventName: T) {super.removeAllListeners<any>(eventName)}

	getStatus()
	{return (this.status)}

	hasSSID()
	{return (this.ssid)}
}