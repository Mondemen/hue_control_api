import { ResourceIdentifier } from "./resource";
import { ServiceGet } from "./service";

export interface EntertainmentSegment
{
	start: number,
	length: number
}

export interface EntertainmentGet extends ServiceGet
{
	/** Indicates if a lamp can be used for entertainment streaming as renderer */
	renderer: boolean,
	/** Indicates which light service is linked to this entertainment service */
	renderer_reference?: ResourceIdentifier<"light">,
	/** Indicates if a lamp can be used for entertainment streaming as a proxy node */
	proxy: boolean,
	/** Indicates if a lamp can handle the equalization factor to dimming maximum brightness in a stream */
	equalizer: boolean,
	/** Indicates the maximum number of parallel streaming sessions the bridge supports */
	max_streams?: number,
	/** Holds all parameters concerning the segmentations capabilities of a device */
	segments?:
	{
		/** Defines if the segmentation of the device are configurable or not */
		configurable: boolean,
		max_segments: number,
		/** Contains the segments configuration of the device for entertainment purposes. A device can be segmented in a single way */
		segments: EntertainmentSegment[]
	}
}