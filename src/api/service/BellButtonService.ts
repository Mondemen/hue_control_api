import Service, { ServiceEvents } from ".";
import { BellButtonEvent, BellButtonGet } from "../types/bell_button";
import { PartialResource } from "../types/resource";

export interface BellButtonServiceEvents extends ServiceEvents
{
	last_event: (id: number, event: BellButtonEvent) => void
}

export default class BellButtonService extends Service
{
	private controlID: number;
	private lastEventDate?: Date;
	private lastEvent?: BellButtonEvent;
	private repeatInterval?: number;
	private supportedEvents?: BellButtonEvent[];

	protected setData(data: PartialResource<BellButtonGet>)
	{
		super.setData(data);
		if (data.metadata)
			this.controlID = data.metadata.control_id;
		if (data.button)
		{
			if (data.button.button_report)
			{
				if (data.button.button_report.updated !== undefined && this.lastEventDate !== data.button.button_report.updated)
					this.emit("last_event", this.controlID, this.lastEvent = data.button.button_report.event);
				this.lastEventDate = data.button.button_report.updated;
			}
			else if (data.button.last_event !== undefined && this.lastEvent !== data.button.last_event)
				this.emit("last_event", this.controlID, this.lastEvent = data.button.last_event);
			this.repeatInterval = data.button.repeat_interval;
			this.supportedEvents = data.button.event_values;
		}
		if (!this.init)
		{
			this.emit("created");
			this.init = true;
		}
		else
			this.emit("updated");
	}

	emit<T extends keyof BellButtonServiceEvents>(eventName: T, ...args: Parameters<BellButtonServiceEvents[T]>) {super.emit<any>(eventName, ...args)}
	on<T extends keyof BellButtonServiceEvents>(eventName: T, listener: BellButtonServiceEvents[T]) {return (super.on<any>(eventName, listener))}
	once<T extends keyof BellButtonServiceEvents>(eventName: T, listener: BellButtonServiceEvents[T]) {return (super.once<any>(eventName, listener))}
	off<T extends keyof BellButtonServiceEvents>(eventName: T, listener: BellButtonServiceEvents[T]) {super.off<any>(eventName, listener)}
	removeAllListeners<T extends keyof BellButtonServiceEvents>(eventName: T) {super.removeAllListeners<any>(eventName)}

	getControlID()
	{return (this.controlID)}

	getLastEventDate()
	{return (this.lastEventDate)}

	getLastEvent()
	{return (this.lastEvent)}

	getRepeatInterval()
	{return (this.repeatInterval)}

	getSupportedEvents()
	{return (this.supportedEvents)}
}
