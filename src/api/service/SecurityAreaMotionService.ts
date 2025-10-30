import { SecurityAreaMotionGet, type SecurityAreaMotionSensitivityStatus, type SecurityAreaMotionSet } from "../types/security_area_motion";
import { PartialResource } from "../types/resource";
import SensorService, { SensorServiceEvents } from "./SensorService";

export interface SecurityAreaMotionServiceEvents extends SensorServiceEvents
{
	motion: (lastChange?: Date) => void;
	sensitivity_status: (status: SecurityAreaMotionSensitivityStatus) => void;
	sensitivity: (sensitivity: number) => void;
}

export default class SecurityAreaMotionService extends SensorService
{
	declare protected toUpdate: SecurityAreaMotionSet;

	private lastEventDate?: Date;
	private sensitivity_status?: SecurityAreaMotionSensitivityStatus;
	private sensitivity?: number;
	private sensitivity_max?: number;

	protected setData(data: PartialResource<SecurityAreaMotionGet>)
	{
		super.setData(data);
		if (data.motion?.motion_report?.motion)
		{
			this.emit("motion", data.motion.motion_report.changed);
			this.lastEventDate = data.motion.motion_report.changed;
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

	emit<T extends keyof SecurityAreaMotionServiceEvents>(eventName: T, ...args: Parameters<SecurityAreaMotionServiceEvents[T]>) {super.emit<any>(eventName, ...args)}
	on<T extends keyof SecurityAreaMotionServiceEvents>(eventName: T, listener: SecurityAreaMotionServiceEvents[T]) {return (super.on<any>(eventName, listener))}
	once<T extends keyof SecurityAreaMotionServiceEvents>(eventName: T, listener: SecurityAreaMotionServiceEvents[T]) {return (super.once<any>(eventName, listener))}
	off<T extends keyof SecurityAreaMotionServiceEvents>(eventName: T, listener: SecurityAreaMotionServiceEvents[T]) {super.off<any>(eventName, listener)}
	removeAllListeners<T extends keyof SecurityAreaMotionServiceEvents>(eventName: T) {super.removeAllListeners<any>(eventName)}

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
