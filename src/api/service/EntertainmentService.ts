import Service from ".";
import Light from "../device/Light";
import { EntertainmentGet, EntertainmentSegment } from "../types/entertainment";
import { PartialResource, ResourceIdentifier } from "../types/resource";

export default class EntertainmentService extends Service
{
	renderer?: ResourceIdentifier<"light">;
	private proxy: boolean;
	private equalizer: boolean;
	private maxStreams?: number;
	private segments?: EntertainmentSegment[];
	private segmentsConfigurable?: boolean;
	private maxSegments?: number;

	protected setData(data: PartialResource<EntertainmentGet>)
	{
		super.setData(data);
		if (data.renderer && data.renderer_reference)
			this.renderer = data.renderer_reference;
		if (typeof data.proxy === "boolean")
			this.proxy = data.proxy;
		if (typeof data.equalizer === "boolean")
			this.equalizer = data.equalizer;
		if (typeof data.max_streams === "number")
			this.maxStreams = data.max_streams;
		if (data.segments)
		{
			if (data.segments.segments)
				this.segments = data.segments.segments;
			if (typeof data.segments.configurable === "boolean")
				this.segmentsConfigurable = data.segments.configurable;
			if (typeof data.segments.max_segments === "number")
				this.maxSegments = data.segments.max_segments;
		}
		if (!this.init)
		{
			this.emit("created");
			this.init = true;
		}
		else
			this.emit("updated");
	}

	get ref(): ResourceIdentifier<"entertainment">
	{return ({rid: this.id, rtype: "entertainment"})}

	getLight()
	{return (this.registry.resources.device.get(this.owner.rid) as Light | undefined)}

	getConfigurations()
	{return (this.registry.resources.entertainment_configuration.filter(config => config.getChannel(this)))}

	getRenderer()
	{return (this.renderer && this.registry.resources.light.get(this.renderer.rid))}

	isProxy()
	{return (this.proxy)}

	isEqualizable()
	{return (this.equalizer)}

	getMaxStreams()
	{return (this.maxStreams)}

	getSegments()
	{return (this.segments)}

	isSegmentsConfigurable()
	{return (this.segmentsConfigurable)}

	getMaxSegments()
	{return (this.maxSegments)}
}
