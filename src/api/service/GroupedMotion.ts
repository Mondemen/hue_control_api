import { GroupedMotionGet } from "../types/grouped_motion";
import { PartialResource } from "../types/resource";
import SensorService, { SensorServiceEvents } from "./SensorService";

export interface GroupedMotionServiceEvents extends SensorServiceEvents
{
	motion: (lastChange?: Date) => void;
}

export default class GroupedMotionService extends SensorService
{
	private lastEventDate?: Date;

	protected setData(data: PartialResource<GroupedMotionGet>)
	{
		super.setData(data);
		if (data.motion)
		{
			if (data.motion.motion_report)
			{
				if (data.motion.motion_report.motion)
				{
					this.emit("motion", data.motion.motion_report.changed);
					this.lastEventDate = data.motion.motion_report.changed;
				}
			}
			else if (data.motion.motion_valid && data.motion.motion)
				this.emit("motion");
		}
		if (!this.init)
		{
			this.emit("created");
			this.init = true;
		}
		else
			this.emit("updated");
	}

	emit<T extends keyof GroupedMotionServiceEvents>(eventName: T, ...args: Parameters<GroupedMotionServiceEvents[T]>) {super.emit<any>(eventName, ...args)}
	on<T extends keyof GroupedMotionServiceEvents>(eventName: T, listener: GroupedMotionServiceEvents[T]) {return (super.on<any>(eventName, listener))}
	once<T extends keyof GroupedMotionServiceEvents>(eventName: T, listener: GroupedMotionServiceEvents[T]) {return (super.once<any>(eventName, listener))}
	off<T extends keyof GroupedMotionServiceEvents>(eventName: T, listener: GroupedMotionServiceEvents[T]) {super.off<any>(eventName, listener)}
	removeAllListeners<T extends keyof GroupedMotionServiceEvents>(eventName: T) {super.removeAllListeners<any>(eventName)}

	getLastEventDate()
	{return (this.lastEventDate)}
}