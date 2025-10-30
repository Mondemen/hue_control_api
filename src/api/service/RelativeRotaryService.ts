import Service, { ServiceEvents } from ".";
import { RelativeRotaryAction, RelativeRotaryDirection, RelativeRotaryGet } from "../types/relative_rotary";
import { PartialResource } from "../types/resource";

export interface RelativeRotaryServiceEvents extends ServiceEvents
{
	last_action: (action: RelativeRotaryAction) => void;
	last_rotation_direction: (direction: RelativeRotaryDirection) => void;
	last_rotation_steps: (steps: number) => void;
	last_rotation_duration: (duration: number) => void;
}

export default class RelativeRotaryService extends Service
{
	private action: RelativeRotaryAction;
	private lastEventDate?: Date;
	private direction: RelativeRotaryDirection;
	private steps: number;
	private duration: number;

	protected setData(data: PartialResource<RelativeRotaryGet>)
	{
		super.setData(data);
		if (data.relative_rotary)
		{
			if (data.relative_rotary.rotary_report)
			{
				if (data.relative_rotary.rotary_report.action)
				{
					this.emit("last_action", this.action = data.relative_rotary.rotary_report.action);
					this.lastEventDate = data.relative_rotary.rotary_report.updated;
				}
				if (data.relative_rotary.rotary_report.rotation.direction)
					this.emit("last_rotation_direction", this.direction = data.relative_rotary.rotary_report.rotation.direction);
				if (data.relative_rotary.rotary_report.rotation.steps)
					this.emit("last_rotation_steps", this.steps = data.relative_rotary.rotary_report.rotation.steps);
				if (data.relative_rotary.rotary_report.rotation.duration)
					this.emit("last_rotation_duration", this.duration = data.relative_rotary.rotary_report.rotation.duration);
			}
			else if (data.relative_rotary.last_level)
			{
				if (data.relative_rotary.last_level.action)
					this.emit("last_action", this.action = data.relative_rotary.last_level.action);
				if (data.relative_rotary.last_level.rotation.direction)
					this.emit("last_rotation_direction", this.direction = data.relative_rotary.last_level.rotation.direction);
				if (data.relative_rotary.last_level.rotation.steps)
					this.emit("last_rotation_steps", this.steps = data.relative_rotary.last_level.rotation.steps);
				if (data.relative_rotary.last_level.rotation.duration)
					this.emit("last_rotation_duration", this.duration = data.relative_rotary.last_level.rotation.duration);
			}
		}
		if (!this.init)
		{
			this.emit("created");
			this.init = true;
		}
		else
			this.emit("updated");
	}

	emit<T extends keyof RelativeRotaryServiceEvents>(eventName: T, ...args: Parameters<RelativeRotaryServiceEvents[T]>) {super.emit<any>(eventName, ...args)}
	on<T extends keyof RelativeRotaryServiceEvents>(eventName: T, listener: RelativeRotaryServiceEvents[T]) {return (super.on<any>(eventName, listener))}
	once<T extends keyof RelativeRotaryServiceEvents>(eventName: T, listener: RelativeRotaryServiceEvents[T]) {return (super.once<any>(eventName, listener))}
	off<T extends keyof RelativeRotaryServiceEvents>(eventName: T, listener: RelativeRotaryServiceEvents[T]) {super.off<any>(eventName, listener)}
	removeAllListeners<T extends keyof RelativeRotaryServiceEvents>(eventName: T) {super.removeAllListeners<any>(eventName)}

	getAction()
	{return (this.action)}

	getLastEventDate()
	{return (this.lastEventDate)}

	getRotationDirection()
	{return (this.direction)}

	getRotationSteps()
	{return (this.steps)}

	getRotationDuration()
	{return (this.duration)}
}
