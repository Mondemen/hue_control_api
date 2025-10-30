import Service, { ServiceEvents } from ".";
import { PartialResource } from "../types/resource";
import { ZigbeeConnectivityChannelStatus, ZigbeeConnectivityChannel, ZigbeeConnectivityGet, ZigbeeConnectivitySet, ZigbeeConnectivityStatus } from "../types/zigbee_connectivity"

export interface ZigbeeConnectivityServiceEvents extends ServiceEvents
{
	connectivity_status: (state: any) => void;
	channel_update: (status: ZigbeeConnectivityChannelStatus, channel?: ZigbeeConnectivityChannel) => void;
}

export default class ZigbeeConnectivityService extends Service
{
	declare protected toUpdate: ZigbeeConnectivitySet;

	private status: ZigbeeConnectivityStatus;
	private macAddress: string;
	private channelStatus?: ZigbeeConnectivityChannelStatus;
	private channel?: ZigbeeConnectivityChannel;
	private extendedPanID?: string;

	protected setData(data: PartialResource<ZigbeeConnectivityGet>)
	{
		super.setData(data);
		if (data.status)
			this.emit("connectivity_status", this.status = data.status);
		if (data.mac_address)
			this.macAddress = data.mac_address;
		if (data.channel)
		{
			this.emit("channel_update", data.channel.status, data.channel.value);
			this.channelStatus = data.channel.status;
			this.channel = data.channel.value;
		}
		if (data.extended_pan_id)
			this.extendedPanID = data.extended_pan_id;
		if (!this.init)
		{
			this.emit("created");
			this.init = true;
		}
		else
			this.emit("updated");
	}

	emit<T extends keyof ZigbeeConnectivityServiceEvents>(eventName: T, ...args: Parameters<ZigbeeConnectivityServiceEvents[T]>) {super.emit<any>(eventName, ...args)}
	on<T extends keyof ZigbeeConnectivityServiceEvents>(eventName: T, listener: ZigbeeConnectivityServiceEvents[T]) {return (super.on<any>(eventName, listener))}
	once<T extends keyof ZigbeeConnectivityServiceEvents>(eventName: T, listener: ZigbeeConnectivityServiceEvents[T]) {return (super.once<any>(eventName, listener))}
	off<T extends keyof ZigbeeConnectivityServiceEvents>(eventName: T, listener: ZigbeeConnectivityServiceEvents[T]) {super.off<any>(eventName, listener)}
	removeAllListeners<T extends keyof ZigbeeConnectivityServiceEvents>(eventName: T) {super.removeAllListeners<any>(eventName)}

	getStatus()
	{return (this.status)}

	getMacAddress()
	{return (this.macAddress)}

	getChannelStatus()
	{return (this.channelStatus)}

	getChannel()
	{return (this.channel)}

	setChannel(channel: ZigbeeConnectivityChannel)
	{
		this.toUpdate.channel ??= {};
		this.toUpdate.channel.value = channel;
		this.updatable = true;
		return (this);
	}

	getExtendedPanID()
	{return (this.extendedPanID)}
}
