import { GroupedLightLevelGet } from "../types/grouped_light_level";
import { PartialResource } from "../types/resource";
import SensorService, { SensorServiceEvents } from "./SensorService";

export interface GroupedLightLevelServiceEvents extends SensorServiceEvents
{
	light_level: (level: number, lastChange?: Date) => void;
}

export default class GroupedLightLevelService extends SensorService
{
	private lastEventDate?: Date;
	private lightLevel?: number;

	protected setData(data: PartialResource<GroupedLightLevelGet>)
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

	emit<T extends keyof GroupedLightLevelServiceEvents>(eventName: T, ...args: Parameters<GroupedLightLevelServiceEvents[T]>) {super.emit<any>(eventName, ...args)}
	on<T extends keyof GroupedLightLevelServiceEvents>(eventName: T, listener: GroupedLightLevelServiceEvents[T]) {return (super.on<any>(eventName, listener))}
	once<T extends keyof GroupedLightLevelServiceEvents>(eventName: T, listener: GroupedLightLevelServiceEvents[T]) {return (super.once<any>(eventName, listener))}
	off<T extends keyof GroupedLightLevelServiceEvents>(eventName: T, listener: GroupedLightLevelServiceEvents[T]) {super.off<any>(eventName, listener)}
	removeAllListeners<T extends keyof GroupedLightLevelServiceEvents>(eventName: T) {super.removeAllListeners<any>(eventName)}

	getLastEventDate()
	{return (this.lastEventDate)}

	getGroupedLightLevel()
	{return (this.lightLevel)}
}