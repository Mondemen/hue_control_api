import Service, { ServiceEvents } from ".";
import { DeviceSoftwareUpdateGet, SoftwareUpdateState } from "../types/device_software_update";
import { PartialResource } from "../types/resource";

export interface DeviceSoftwareUpdateServiceEvents extends ServiceEvents
{
	state: (state: SoftwareUpdateState) => void
	problems: (problems: any[]) => void
}

export default class DeviceSoftwareUpdateService extends Service
{
	private state: SoftwareUpdateState;
	private problems: any[];

	protected setData(data: PartialResource<DeviceSoftwareUpdateGet>)
	{
		super.setData(data);
		if (data.state !== undefined && data.state !== this.state)
			this.emit("state", this.state = data.state);
		if (data.problems !== undefined)
			this.emit("problems", this.problems = data.problems);
		this.problems ??= [];
		if (!this.init)
		{
			this.emit("created");
			this.init = true;
		}
		else
			this.emit("updated");
	}

	emit<T extends keyof DeviceSoftwareUpdateServiceEvents>(eventName: T, ...args: Parameters<DeviceSoftwareUpdateServiceEvents[T]>) {super.emit<any>(eventName, ...args)}
	on<T extends keyof DeviceSoftwareUpdateServiceEvents>(eventName: T, listener: DeviceSoftwareUpdateServiceEvents[T]) {return (super.on<any>(eventName, listener))}
	once<T extends keyof DeviceSoftwareUpdateServiceEvents>(eventName: T, listener: DeviceSoftwareUpdateServiceEvents[T]) {return (super.once<any>(eventName, listener))}
	off<T extends keyof DeviceSoftwareUpdateServiceEvents>(eventName: T, listener: DeviceSoftwareUpdateServiceEvents[T]) {super.off<any>(eventName, listener)}
	removeAllListeners<T extends keyof DeviceSoftwareUpdateServiceEvents>(eventName: T) {super.removeAllListeners<any>(eventName)}

	getState()
	{return (this.state)}

	getProblems()
	{return (this.problems)}
}
