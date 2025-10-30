import Service, { ServiceEvents } from ".";
import { PartialResource } from "../types/resource";
import { ZgpConnectivityGet, ZgpConnectivityStatus } from "../types/zgp_connectivity";

export interface ZgpConnectivityServiceEvents extends ServiceEvents
{
	connectivity_status: (state: any) => void;
	channel_confirm: (date: Date) => void;
}

export default class ZgpConnectivityService extends Service
{
	private status: ZgpConnectivityStatus;
	private channelConfirmed: Date;

	protected setData(data: PartialResource<ZgpConnectivityGet>)
	{
		super.setData(data);
		if (data.status)
			this.emit("connectivity_status", this.status = data.status);
		if (data.channel_confirmed !== undefined && this.channelConfirmed !== data.channel_confirmed)
			this.emit("channel_confirm", this.channelConfirmed = data.channel_confirmed);
		if (!this.init)
		{
			this.emit("created");
			this.init = true;
		}
		else
			this.emit("updated");
	}

	emit<T extends keyof ZgpConnectivityServiceEvents>(eventName: T, ...args: Parameters<ZgpConnectivityServiceEvents[T]>) {super.emit<any>(eventName, ...args)}
	on<T extends keyof ZgpConnectivityServiceEvents>(eventName: T, listener: ZgpConnectivityServiceEvents[T]) {return (super.on<any>(eventName, listener))}
	once<T extends keyof ZgpConnectivityServiceEvents>(eventName: T, listener: ZgpConnectivityServiceEvents[T]) {return (super.once<any>(eventName, listener))}
	off<T extends keyof ZgpConnectivityServiceEvents>(eventName: T, listener: ZgpConnectivityServiceEvents[T]) {super.off<any>(eventName, listener)}
	removeAllListeners<T extends keyof ZgpConnectivityServiceEvents>(eventName: T) {super.removeAllListeners<any>(eventName)}

	getStatus()
	{return (this.status)}

	getChannelConfirm()
	{return (this.channelConfirmed)}
}