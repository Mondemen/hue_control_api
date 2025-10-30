import { LightLevelGet } from "../types/light_level";
import { PartialResource } from "../types/resource";
import SensorService, { SensorServiceEvents } from "./SensorService";

export interface LightLevelServiceEvents extends SensorServiceEvents
{
	light_level: (level: number, lastChange?: Date) => void;
}

export default class LightLevelService extends SensorService
{
	private lastEventDate?: Date;
	private lightLevel?: number;

	protected setData(data: PartialResource<LightLevelGet>)
	{
		super.setData(data);
		if (data.light)
		{
			if (data.light.light_level_report)
			{
				if (data.light.light_level_report.light_level)
				{
					this.emit("light_level", this.lightLevel = data.light.light_level_report.light_level, data.light.light_level_report.changed);
					this.lastEventDate = data.light.light_level_report.changed;
				}
			}
			else if (data.light.light_level_valid && data.light.light_level)
				this.emit("light_level", this.lightLevel = data.light.light_level);
		}
		if (!this.init)
		{
			this.emit("created");
			this.init = true;
		}
		else
			this.emit("updated");
	}

	emit<T extends keyof LightLevelServiceEvents>(eventName: T, ...args: Parameters<LightLevelServiceEvents[T]>) {super.emit<any>(eventName, ...args)}
	on<T extends keyof LightLevelServiceEvents>(eventName: T, listener: LightLevelServiceEvents[T]) {return (super.on<any>(eventName, listener))}
	once<T extends keyof LightLevelServiceEvents>(eventName: T, listener: LightLevelServiceEvents[T]) {return (super.once<any>(eventName, listener))}
	off<T extends keyof LightLevelServiceEvents>(eventName: T, listener: LightLevelServiceEvents[T]) {super.off<any>(eventName, listener)}
	removeAllListeners<T extends keyof LightLevelServiceEvents>(eventName: T) {super.removeAllListeners<any>(eventName)}

	getLastEventDate()
	{return (this.lastEventDate)}

	getLightLevel()
	{return (this.lightLevel)}
}