import { PartialResource } from "../types/resource";
import SensorService, { SensorServiceEvents } from "./SensorService";
import { TamperGet, TamperReport, TamperSource, TamperState } from "../types/tamper";

export interface TamperServiceEvents extends SensorServiceEvents
{
	state: (state: TamperState, source: TamperSource, lastChange: Date) => void;
}

export default class TamperService extends SensorService
{
	private tampers: TamperReport[];

	protected setData(data: PartialResource<TamperGet>)
	{
		super.setData(data);
		if (data.tamper_reports)
		{
			data.tamper_reports.forEach(report => this.emit("state", report.state, report.source, report.changed));
			this.tampers = data.tamper_reports;
		}
		if (!this.init)
		{
			this.emit("created");
			this.init = true;
		}
		else
			this.emit("updated");
	}

	emit<T extends keyof TamperServiceEvents>(eventName: T, ...args: Parameters<TamperServiceEvents[T]>) {super.emit<any>(eventName, ...args)}
	on<T extends keyof TamperServiceEvents>(eventName: T, listener: TamperServiceEvents[T]) {return (super.on<any>(eventName, listener))}
	once<T extends keyof TamperServiceEvents>(eventName: T, listener: TamperServiceEvents[T]) {return (super.once<any>(eventName, listener))}
	off<T extends keyof TamperServiceEvents>(eventName: T, listener: TamperServiceEvents[T]) {super.off<any>(eventName, listener)}
	removeAllListeners<T extends keyof TamperServiceEvents>(eventName: T) {super.removeAllListeners<any>(eventName)}

	getTampers()
	{return (this.tampers)}
}