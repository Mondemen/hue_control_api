import Service, { ServiceEvents } from ".";
import { PartialResource } from "../types/resource";
import { SearchActionType, ZigbeeDeviceDiscoveryGet, ZigbeeDeviceDiscoverySet, ZigbeeDeviceDiscoveryStatus } from "../types/zigbee_device_discovery";

export interface ZigbeeDeviceDiscoveryServiceEvent extends ServiceEvents
{
	status: (state: ZigbeeDeviceDiscoveryStatus) => void;
}

export default class ZigbeeDeviceDiscoveryService extends Service
{
	declare protected toUpdate: ZigbeeDeviceDiscoverySet;

	private status: ZigbeeDeviceDiscoveryStatus;
	private searchCodes?: string[];

	protected setData(data: PartialResource<ZigbeeDeviceDiscoveryGet>)
	{
		super.setData(data);
		if (data.status && this.status !== data.status)
			this.emit("status", this.status = data.status);
		if (data.action)
			this.searchCodes = data.action.search_codes;
		if (!this.init)
		{
			this.emit("created");
			this.init = true;
		}
		else
			this.emit("updated");
	}

	emit<T extends keyof ZigbeeDeviceDiscoveryServiceEvent>(eventName: T, ...args: Parameters<ZigbeeDeviceDiscoveryServiceEvent[T]>) {super.emit<any>(eventName, ...args)}
	on<T extends keyof ZigbeeDeviceDiscoveryServiceEvent>(eventName: T, listener: ZigbeeDeviceDiscoveryServiceEvent[T]) {return (super.on<any>(eventName, listener))}
	once<T extends keyof ZigbeeDeviceDiscoveryServiceEvent>(eventName: T, listener: ZigbeeDeviceDiscoveryServiceEvent[T]) {return (super.once<any>(eventName, listener))}
	off<T extends keyof ZigbeeDeviceDiscoveryServiceEvent>(eventName: T, listener: ZigbeeDeviceDiscoveryServiceEvent[T]) {super.off<any>(eventName, listener)}
	removeAllListeners<T extends keyof ZigbeeDeviceDiscoveryServiceEvent>(eventName: T) {super.removeAllListeners<any>(eventName)}

	getStatus()
	{return (this.status)}

	getSearchCode()
	{return (this.searchCodes)}

	addSearchCode(code: string, mode?: SearchActionType)
	{
		this.toUpdate.action ??= {action_type: mode ?? "search", search_codes: []};
		if (!this.toUpdate.action.search_codes?.includes(code))
			this.toUpdate.action.search_codes?.push(code)
		return (this);
	}

	deleteSearchCode(code: string)
	{
		if (Array.isArray(this.toUpdate.action?.search_codes))
			this.toUpdate.action.search_codes = this.toUpdate.action.search_codes.filter(c => c !== code);
		return (this);
	}

	async search()
	{
		this.toUpdate.action ??= {action_type: "search"};
		this.toUpdate.action.action_type = "search";
		return (this);
	}
}
