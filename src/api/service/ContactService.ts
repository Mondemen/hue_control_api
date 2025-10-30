import { PartialResource } from "../types/resource";
import { ContactGet, ContactState } from "../types/contact";
import SensorService, { SensorServiceEvents } from "./SensorService";

export interface ContactServiceEvents extends SensorServiceEvents
{
	state: (state: ContactState, lastChange: Date) => void;
}

export default class ContactService extends SensorService
{
	private lastEventDate?: Date;
	private state?: ContactState;

	protected setData(data: PartialResource<ContactGet>)
	{
		super.setData(data);
		if (data.contact_report?.state && this.state !== data.contact_report.state)
			this.emit("state", this.state = data.contact_report.state, this.lastEventDate = data.contact_report.changed);
		if (!this.init)
		{
			this.emit("created");
			this.init = true;
		}
		else
			this.emit("updated");
	}

	emit<T extends keyof ContactServiceEvents>(eventName: T, ...args: Parameters<ContactServiceEvents[T]>) {super.emit<any>(eventName, ...args)}
	on<T extends keyof ContactServiceEvents>(eventName: T, listener: ContactServiceEvents[T]) {return (super.on<any>(eventName, listener))}
	once<T extends keyof ContactServiceEvents>(eventName: T, listener: ContactServiceEvents[T]) {return (super.once<any>(eventName, listener))}
	off<T extends keyof ContactServiceEvents>(eventName: T, listener: ContactServiceEvents[T]) {super.off<any>(eventName, listener)}
	removeAllListeners<T extends keyof ContactServiceEvents>(eventName: T) {super.removeAllListeners<any>(eventName)}

	getLastEventDate()
	{return (this.lastEventDate)}

	getState()
	{return (this.state)}
}