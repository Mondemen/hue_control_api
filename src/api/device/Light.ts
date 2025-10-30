import Device, { DeviceEvents, DeviceType } from ".";
import { ColorValue } from "../../lib/Color";
import Mired from "../../lib/Mired";
import LightService, { LightServiceEvents } from "../service/LightService";
import { AlertType } from "../types/capability/alert";
import { EffectType } from "../types/capability/effect_v2";
import { SignalType } from "../types/capability/signaling";
import { TimedEffectType } from "../types/capability/timed_effect";
import { DeviceGet } from "../types/device";
import { LightCapability, LightFunction } from "../types/light";
import { PartialResource, ResourceIdentifier } from "../types/resource";

function setTimeout(delay: number)
{return (new Promise(resolve => global.setTimeout(resolve, delay)))}

export type LightEvents = DeviceEvents & LightServiceEvents;

export class LightPaletteItem extends Device
{
	public deviceType: DeviceType = "light";

	static is(resource: DeviceGet)
	{
		const services = resource.services;

		return (services.filter(service => service.rtype === "light").length >= 1);
	}

	protected setData(data: PartialResource<DeviceGet>)
	{
		super.setData(data);
		if (!this.init)
		{
			this.emit("created");
			this.init = true;
		}
		else
			this.emit("updated");
	}

	emit<T extends keyof LightEvents>(eventName: T, ...args: Parameters<LightEvents[T]>) {super.emit<any>(eventName, ...args)}
	on<T extends keyof LightEvents>(eventName: T, listener: LightEvents[T]) {return (super.on<any>(eventName, listener))}
	once<T extends keyof LightEvents>(eventName: T, listener: LightEvents[T]) {return (super.once<any>(eventName, listener))}
	off<T extends keyof LightEvents>(eventName: T, listener: LightEvents[T]) {super.off<any>(eventName, listener)}
	removeAllListeners<T extends keyof LightEvents>(eventName: T) {super.removeAllListeners<any>(eventName)}

	get lightServices()
	{return ((this.services as ResourceIdentifier<"light">[]).filter(ref => ref.rtype === "light"))}

	get entertainmentService()
	{return (this.services.find(ref => ref.rtype === "entertainment") as ResourceIdentifier<"entertainment"> | undefined)}

	getLightServices()
	{return (this.lightServices.map(device => this.registry.resources.light.get(device.rid)).filter(Boolean) as LightService[])}

	getEntertainment()
	{
		const entertainmentService = this.entertainmentService;

		return (entertainmentService && this.registry.resources.entertainment.get(entertainmentService.rid));
	}

	getFixedMired()
	{return (this.getLightServices()[0].getFixedMired())}

	getFunction()
	{return (this.getLightServices()[0].getFunction())}

	setFunction(functionType: LightFunction)
	{
		this.getLightServices().forEach(light => light.setFunction(functionType));
		return (this);
	}

	getProductName()
	{return (this.getLightServices()[0].getProductName())}

	getProductArchetype()
	{return (this.getLightServices()[0].getProductArchetype())}

	getProductFunction()
	{return (this.getLightServices()[0].getProductFunction())}

	getServiceID()
	{return (this.getLightServices()[0].getServiceID())}

	hasCapability(capability: LightCapability): boolean;
	hasCapability(capabilities: LightCapability[]): boolean;
	hasCapability(value: LightCapability | LightCapability[])
	{return (this.getLightServices()[0].hasCapability(value))}

	getState()
	{return (this.getLightServices()[0].getState())}

	setState(state: boolean)
	{
		this.getLightServices().forEach(light => light.setState(state));
		return (this);
	}

	getBrightness()
	{return (this.getLightServices()[0].getBrightness())}

	getMinDimLevel()
	{return (this.getLightServices()[0].getMinDimLevel())}

	setBrightness(brightness: number)
	{
		this.getLightServices().forEach(light => light.setBrightness(brightness));
		return (this);
	}

	setBrightnessDelta(delta: number | "stop")
	{
		this.getLightServices().forEach(light => light.setBrightnessDelta(delta));
		return (this);
	}

	getColorTemperature()
	{return (this.getLightServices()[0].getColorTemperature())}

	getMinMirek()
	{return (this.getLightServices()[0].getMinMirek())}

	getMaxMirek()
	{return (this.getLightServices()[0].getMaxMirek())}

	setColorTemperature(mired: Mired | ColorValue | number)
	{
		this.getLightServices().forEach(light => light.setColorTemperature(mired));
		return (this);
	}

	setColorTemperatureDelta(delta: number | "stop")
	{
		this.getLightServices().forEach(light => light.setColorTemperatureDelta(delta));
		return (this);
	}

	getColor()
	{return (this.getLightServices()[0].getColor())}


	setColor(color: ColorValue)
	{
		this.getLightServices().forEach(light => light.setColor(color));
		return (this);
	}

	getColorGamut()
	{return (this.getLightServices()[0].getColorGamut())}

	getColorGamutType()
	{return (this.getLightServices()[0].getColorGamutType())}

	getDynamicStatus()
	{return (this.getLightServices()[0].getDynamicStatus())}

	getDynamicStatusValues()
	{return (this.getLightServices()[0].getDynamicStatusValues())}

	getDynamicSpeed()
	{return (this.getLightServices()[0].getDynamicSpeed())}

	setDynamicSpeed(speed: number)
	{
		this.getLightServices().forEach(light => light.setDynamicSpeed(speed));
		return (this);
	}

	getSupportedAlertValues()
	{return (this.getLightServices()[0].getSupportedAlertValues())}

	setAlert(alert: AlertType)
	{
		this.getLightServices().forEach(light => light.setAlert(alert));
		return (this);
	}

	getSignal()
	{return (this.getLightServices()[0].getSignal())}

	getSupportedSignalingValues()
	{return (this.getLightServices()[0].getSupportedSignalingValues())}

	setSignaling(signal: Exclude<SignalType, "no_signal">, duration: number, colors?: ColorValue[])
	{
		this.getLightServices().forEach(light => light.setSignaling(signal, duration, colors));
		return (this);
	}

	getSignalEstimatedEnd()
	{return (this.getLightServices()[0].getSignalEstimatedEnd())}

	getSignalColors()
	{return (this.getLightServices()[0].getSignalColors())}

	getGradient()
	{return (this.getLightServices()[0].getGradient())}

	getEffect()
	{return (this.getLightServices()[0].getEffect())}

	setEffect(effect: EffectType, speed?: number)
	{
		this.getLightServices().forEach(light => light.setEffect(effect, speed));
		return (this);
	}

	setColorEffect(effect: EffectType, color: ColorValue, speed?: number)
	{
		this.getLightServices().forEach(light => light.setColorEffect(effect, color, speed));
		return (this);
	}

	setColorTemperatureEffect(effect: EffectType, mirek: Mired | ColorValue | number, speed?: number)
	{
		this.getLightServices().forEach(light => light.setColorTemperatureEffect(effect, mirek, speed));
		return (this);
	}

	getPossibleEffectValues()
	{return (this.getLightServices()[0].getPossibleEffectValues())}

	getEffectValues()
	{return (this.getLightServices()[0].getEffectValues())}

	getTimedEffect()
	{return (this.getLightServices()[0].getTimedEffect())}

	setTimedEffect(effect: TimedEffectType, duration?: number)
	{
		this.getLightServices().forEach(light => light.setTimedEffect(effect, duration));
		return (this);
	}

	getPossibleTimedEffectValues()
	{return (this.getLightServices()[0].getPossibleTimedEffectValues())}

	getTimedEffectValues()
	{return (this.getLightServices()[0].getTimedEffectValues())}

	getPowerup()
	{return (this.getLightServices()[0].getPowerup())}

	getMode()
	{return (this.getLightServices()[0].getMode())}
}

export default class Light extends LightPaletteItem
{
	private paletteID?: number | NodeJS.Timeout;

	async identify()
	{Promise.all(this.getLightServices().map(light => light.identify()))}

	setDuration(duration: number)
	{
		this.getLightServices().forEach(light => light.setDuration(duration));
		return (this);
	}

	startPalette(palette: ((light: LightPaletteItem) => void)[], transition: number, offset?: number)
	{
		let index = 0;
		const init = async () =>
		{
			if (offset)
				await setTimeout(offset);
			palette[0](this);
			await this.setDuration(0).update();
			await setTimeout(150);
			index = (index + 1) % palette.length;
			palette[index](this);
			await this.setDuration(transition).update();
		}

		this.stopPalette();
		init();
		this.paletteID = setInterval(() =>
		{
			index = (index + 1) % palette.length;
			palette[index](this);
			this.setDuration(transition).update();
		}, transition);
	}

	stopPalette()
	{
		if (this.paletteID !== undefined)
		{
			clearInterval(this.paletteID);
			this.paletteID = undefined;
		}
	}

	async update()
	{
		const promises: Promise<void>[] = [];

		promises.push(super.update());
		for (const light of this.getLightServices())
			promises.push(light.update());
		await Promise.all(promises);
	}
}