import { PartialResource } from "../types/resource";
import { TemperatureGet } from "../types/temperature";
import SensorService, { SensorServiceEvents } from "./SensorService";

export interface TemperatureServiceEvents extends SensorServiceEvents
{
	temperature: (level: number, lastChange?: Date) => void;
}

export default class TemperatureService extends SensorService
{
	private lastEventDate?: Date;
	private temperature?: number;

	protected setData(data: PartialResource<TemperatureGet>)
	{
		super.setData(data);
		if (data.temperature)
		{
			if (data.temperature.temperature_report)
			{
				if (data.temperature.temperature_report.temperature)
				{
					this.emit("temperature", this.temperature = data.temperature.temperature_report.temperature, data.temperature.temperature_report.changed);
					this.lastEventDate = data.temperature.temperature_report.changed;
				}
			}
			else if (data.temperature.temperature_valid && data.temperature.temperature)
				this.emit("temperature", this.temperature = data.temperature.temperature);
		}
		if (!this.init)
		{
			this.emit("created");
			this.init = true;
		}
		else
			this.emit("updated");
	}

	emit<T extends keyof TemperatureServiceEvents>(eventName: T, ...args: Parameters<TemperatureServiceEvents[T]>) {super.emit<any>(eventName, ...args)}
	on<T extends keyof TemperatureServiceEvents>(eventName: T, listener: TemperatureServiceEvents[T]) {return (super.on<any>(eventName, listener))}
	once<T extends keyof TemperatureServiceEvents>(eventName: T, listener: TemperatureServiceEvents[T]) {return (super.once<any>(eventName, listener))}
	off<T extends keyof TemperatureServiceEvents>(eventName: T, listener: TemperatureServiceEvents[T]) {super.off<any>(eventName, listener)}
	removeAllListeners<T extends keyof TemperatureServiceEvents>(eventName: T) {super.removeAllListeners<any>(eventName)}

	getLastEventDate()
	{return (this.lastEventDate)}

	getTemperature()
	{return (this.temperature)}
}