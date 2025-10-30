import { number } from "yup";
import Service, { ServiceEvents } from ".";
import { AlertType } from "../types/capability/alert";
import { SignalType } from "../types/capability/signaling";
import { GroupedLightGet, GroupedLightSet } from "../types/grouped_light";
import Mired from "../../lib/Mired";
import Color, { ColorValue } from "../../lib/Color";
import { PartialResource } from "../types/resource";

export interface GroupedLightServiceEvent extends ServiceEvents
{
	state: (state: boolean) => void;
	brightness: (brightness: number) => void;
}

export default class GroupedLightService extends Service
{
	declare protected toUpdate: GroupedLightSet;

	private state?: boolean;
	private brightness?: number;
	private alertValues?: AlertType[];
	private signalValues?: SignalType[];

	protected setData(data: PartialResource<GroupedLightGet>)
	{
		super.setData(data);
		if (data.on && this.state !== data.on.on)
			this.emit("state", this.state = data.on.on);
		if (data.dimming && this.brightness !== data.dimming.brightness)
			this.emit("brightness", this.brightness = data.dimming.brightness);
		if (data.alert)
			this.alertValues = data.alert.action_values;
		if (data.signaling)
			this.signalValues = data.signaling.signal_values;
		if (!this.init)
		{
			this.emit("created");
			this.init = true;
		}
		else
			this.emit("updated");
	}

	emit<T extends keyof GroupedLightServiceEvent>(eventName: T, ...args: Parameters<GroupedLightServiceEvent[T]>) {super.emit<any>(eventName, ...args)}
	on<T extends keyof GroupedLightServiceEvent>(eventName: T, listener: GroupedLightServiceEvent[T]) {return (super.on<any>(eventName, listener))}
	once<T extends keyof GroupedLightServiceEvent>(eventName: T, listener: GroupedLightServiceEvent[T]) {return (super.once<any>(eventName, listener))}
	off<T extends keyof GroupedLightServiceEvent>(eventName: T, listener: GroupedLightServiceEvent[T]) {super.off<any>(eventName, listener)}
	removeAllListeners<T extends keyof GroupedLightServiceEvent>(eventName: T) {super.removeAllListeners<any>(eventName)}

	getState()
	{return (this.toUpdate.on?.on ?? this.state)}

	setState(state: boolean)
	{
		this.toUpdate.on = {on: state};
		this.updatable = true;
		return (this);
	}

	getBrightness()
	{return (this.toUpdate.dimming?.brightness ?? this.brightness)}

	setBrightness(brightness: number)
	{
		brightness = number().min(0).max(100).required().validateSync(brightness);
		this.toUpdate.dimming = {brightness};
		this.updatable = true;
		return (this);
	}

	setBrightnessDelta(delta: number | "stop")
	{
		if (delta === "stop")
			this.toUpdate.dimming_delta = {action: delta};
		else
		{
			if (delta < 0)
				this.toUpdate.dimming_delta = {action: "down", brightness_delta: Math.abs(delta)};
			else
				this.toUpdate.dimming_delta = {action: "up", brightness_delta: Math.abs(delta)};
		}
		this.updatable = true;
		return (this);
	}

	setColorTemperature(mired: Mired | ColorValue | number)
	{
		this.toUpdate.color_temperature = {mirek: new Mired(mired).mirek()};
		this.updatable = true;
		return (this);
	}

	setColorTemperatureDelta(delta: Mired | ColorValue | number | "stop")
	{
		let mired: number;

		if (delta === "stop")
			this.toUpdate.color_temperature_delta = {action: delta};
		else
		{
			mired = new Mired(delta).mirek();
			if (mired < 0)
				this.toUpdate.color_temperature_delta = {action: "down", mirek_delta: Math.abs(mired)};
			else
				this.toUpdate.color_temperature_delta = {action: "up", mirek_delta: Math.abs(mired)};
		}
		this.updatable = true;
		return (this);
	}

	setColor(color: ColorValue)
	{
		this.toUpdate.color = {xy: new Color(color).xy()};
		this.updatable = true;
		return (this);
	}

	setDuration(duration: number)
	{
		this.toUpdate.dynamics ??= {};
		this.toUpdate.dynamics.duration = duration
		this.updatable = true;
		return (this);
	}

	setSpeed(speed: number)
	{
		this.toUpdate.dynamics ??= {};
		this.toUpdate.dynamics.speed = speed
		this.updatable = true;
		return (this);
	}

	getSupportedAlertValues()
	{return (this.alertValues)}

	setAlert(alert: AlertType)
	{
		this.toUpdate.alert = {action: alert};
		this.updatable = true;
		return (this);
	}

	getSupportedSignalingValues()
	{return (this.signalValues)}

	setSignaling(signal: SignalType, duration: number)
	{
		this.toUpdate.signaling = {signal, duration};
		this.updatable = true;
		return (this);
	}
}