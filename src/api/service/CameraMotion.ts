import { CameraMotionGet, CameraMotionSensitivityStatus, CameraMotionSet } from "../types/camera_motion";
import { PartialResource } from "../types/resource";
import SensorService, { SensorServiceEvents } from "./SensorService";

export interface CameraMotionServiceEvents extends SensorServiceEvents
{
	motion: (lastChange?: Date) => void;
	sensitivity_status: (status: CameraMotionSensitivityStatus) => void;
	sensitivity: (sensitivity: number) => void;
}

export default class CameraMotionService extends SensorService
{
	declare protected toUpdate: CameraMotionSet;

	private lastEventDate?: Date;
	private sensitivity_status?: CameraMotionSensitivityStatus;
	private sensitivity?: number;
	private sensitivity_max?: number;

	protected setData(data: PartialResource<CameraMotionGet>)
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
		if (data.sensitivity)
		{
			if (this.sensitivity_status !== data.sensitivity.status)
				this.emit("sensitivity_status", this.sensitivity_status = data.sensitivity.status);
			if (data.sensitivity.sensitivity !== undefined)
				this.emit("sensitivity", this.sensitivity = data.sensitivity.sensitivity);
			this.sensitivity_max = data.sensitivity.sensitivity_max;
		}
		if (!this.init)
		{
			this.emit("created");
			this.init = true;
		}
		else
			this.emit("updated");
	}

	emit<T extends keyof CameraMotionServiceEvents>(eventName: T, ...args: Parameters<CameraMotionServiceEvents[T]>) {super.emit<any>(eventName, ...args)}
	on<T extends keyof CameraMotionServiceEvents>(eventName: T, listener: CameraMotionServiceEvents[T]) {return (super.on<any>(eventName, listener))}
	once<T extends keyof CameraMotionServiceEvents>(eventName: T, listener: CameraMotionServiceEvents[T]) {return (super.once<any>(eventName, listener))}
	off<T extends keyof CameraMotionServiceEvents>(eventName: T, listener: CameraMotionServiceEvents[T]) {super.off<any>(eventName, listener)}
	removeAllListeners<T extends keyof CameraMotionServiceEvents>(eventName: T) {super.removeAllListeners<any>(eventName)}

	getLastEventDate()
	{return (this.lastEventDate)}

	getSensitivityStatus()
	{return (this.sensitivity_status)}

	getSensitivity()
	{return (this.toUpdate.sensitivity ?? this.sensitivity)}

	getSensitivityMax()
	{return (this.sensitivity_max)}

	setSensitivity(sensitivity: number)
	{
		this.toUpdate.sensitivity ??= {};
		this.toUpdate.sensitivity.sensitivity = sensitivity;
		this.updatable = true;
		return (this);
	}
}