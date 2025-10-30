import { AnimationTimingConfig, SequenceAnimation, TimingAnimation } from "../../../types/Animation";
import Color, { ColorValue, isHSL, isHSV, isRGB, isXY, XYValue } from "../../lib/Color";
import Animation from "../Animated";
import Light from "./Light";

interface AnimationData
{
	frames: number,
	totalFrames: number,
	loop: number
}

export default class LightStream
{
	protected channelID: number;
	protected light: Light;
	protected color?: XYValue;
	protected brightness?: number;

	protected sequenceStream?: SequenceAnimation;
	protected animationFrameOffset = 0;
	protected animationData: Record<string, AnimationData> = {};

	constructor(channelID: number, light: Light)
	{
		this.channelID = channelID;
		this.light = light;
	}

	getChannelID()
	{return (this.channelID)}

	getID()
	{return (this.light.getID())}

	getLight()
	{return (this.light)}

	isStreaming()
	{return (this.light.getMode() === "streaming")}

	getName()
	{return (this.light.getName())}

	getArchetype()
	{return (this.light.getArchetype())}

	getColor()
	{return (this.color ? new Color(this.color) : undefined)}

	setColor(color: ColorValue)
	{
		if (color instanceof Color)
			this.color = color.xy();
		else if (isXY(color))
			this.color = color;
		else if (isRGB(color))
			this.color = Color.RGBToXY(color.r, color.g, color.b, this.light.getColorGamut());
		else if (isHSV(color))
			this.color = Color.HSVToXY(color.h, color.s, color.v, this.light.getColorGamut());
		else if (isHSL(color))
			this.color = Color.HSLToXY(color.h, color.s, color.l, this.light.getColorGamut());
		else
			this.color = new Color(color, this.light.getColorGamut()).xy();
		return (this);
	}

	getBrightness()
	{return (this.brightness)}

	setBrightness(brighness: number)
	{
		this.brightness = brighness;
		return (this);
	}

	sequence(animations: (AnimationTimingConfig | TimingAnimation)[])
	{
		this.sequenceStream = Animation.sequence(animations);
	}
}

export class LightStreamInternal extends LightStream
{
	declare public color?: XYValue;
	declare public brightness?: number;
	declare public sequenceStream?: SequenceAnimation;
	declare public animationFrameOffset: number;
	declare public animationData: Record<string, AnimationData>;

	startSequence(frame: number, framesPerSecond?: number)
	{this.sequenceStream?.start(this, frame, framesPerSecond)}
}