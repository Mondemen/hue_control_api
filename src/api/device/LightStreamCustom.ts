import { ColorValue } from "../../lib/Color";
import Light from "./Light";
import { LightStreamInternal } from "./LightStream";

export default class LightStreamCustom extends LightStreamInternal
{
	private throttleUpdateDelay = 250;
	private throttleUpdateTimer: NodeJS.Timeout | number | string | null = null;

	constructor(channelID: number, light: Light, throttle = 250)
	{
		super(channelID, light);
		this.throttleUpdateDelay = throttle;
	}

	setColor(color: ColorValue)
	{
		super.setColor(color);
		if (this.color)
			this.light.setColor(this.color);
		return (this);
	}

	setBrightness(brightness: number)
	{
		super.setBrightness(brightness);
		if (this.brightness !== undefined)
			this.light.setBrightness(this.brightness);
		return (this);
	}

	async update()
	{
		if (this.throttleUpdateTimer === null)
		{
			this.throttleUpdateTimer = setTimeout(() => this.throttleUpdateTimer = null, this.throttleUpdateDelay);
			this.light.setState(this.brightness ? true : false);
			this.light.setDuration(this.throttleUpdateDelay);
			await this.light.update();
		}
	}
}
