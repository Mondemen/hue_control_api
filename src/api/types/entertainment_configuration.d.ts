import { ResourceGet, ResourceIdentifier } from "./resource";

export type EntertainmentConfigurationType = "screen" | "monitor" | "music" | "3dspace" | "other";
export type EntertainmentConfigurationStatus = "active" | "inactive";
export type EntertainmentConfigurationStreamMode = "auto" | "manual";
export type EntertainmentConfigurationAction = "start" | "stop";

export interface EntertainmentChannelPosition
{
	/** Coordinate of a single axis */
	x: number,
	/** Coordinate of a single axis */
	y: number,
	/** Coordinate of a single axis */
	z: number
}

export interface EntertainmentChannelMember<S = ResourceIdentifier<"entertainment">>
{
	service: S,
	index: number
}

export interface EntertainmentChannel
{
	/** Bridge assigns a number upon creation. This is the number to be used by the HueStream API when addressing the channel */
	channel_id: number,
	/** xyz position of this channel. It is the average position of its members */
	position: EntertainmentChannelPosition,
	/** List that references segments that are members of that channel */
	members: EntertainmentChannelMember[]
}

export interface EntertainmentConfigurationGet extends ResourceGet
{
	metadata:
	{
		/** Friendly name of the entertainment configuration */
		name: string
	},
	/**
	 * Friendly name of the entertainment configuration
	 * @deprecated
	 */
	name: string,
	/**
	 * Defines for which type of application this channel assignment was optimized for
	 * * "screen": Channels are organized around content from a screen
	 * * "monitor": Channels are organized around content from one or several monitors
	 * * "music": Channels are organized for music synchronization
	 * * "3dspac": Channels are organized to provide 3d spacial effects
	 * * "other": General use case
	 */
	configuration_type: EntertainmentConfigurationType,
	/** Read only field reporting if the stream is active or not */
	status: EntertainmentConfigurationStatus,
	/** Expected value is of a ResourceIdentifier of the type auth_v1 i.e. an application id, only available if status is active */
	active_streamer?: ResourceIdentifier<"auth_v1">,
	stream_proxy:
	{
		/**
		 * Proxymode used for this group
		 * * auto – The bridge will select a proxynode automatically.
		 * * manual – The proxynode has been set manually
		 */
		mode: EntertainmentConfigurationStreamMode,
		/**
		 * Reference to the device acting as proxy The proxynode relays the entertainment traffic and should be located
		 * in or close to all entertainment lamps in this group. The proxynode set by the application (manual) resp
		 * selected by the bridge (auto). Writing sets proxymode to “manual”. Is not allowed to be combined with attribute
		 * “proxymode”:”auto” Can be type BridgeDevice or ZigbeeDevice
		 */
		node: ResourceIdentifier<"entertainment">
	},
	/** Holds the channels. Each channel groups segments of one or different light */
	channels: EntertainmentChannel[],
	/** Entertainment services of the lights that are in the zone have locations */
	location:
	{
		service_locations:
		{
			service: ResourceIdentifier<"entertainment">,
			/**
			 * Describes the location of the service.
			 * @deprecated Use positions
			 */
			position?: EntertainmentChannelPosition,
			/** Describes the location of the service. */
			positions: EntertainmentChannelPosition[],
			/**
			 * Relative equalization factor applied to the entertainment service, to compensate for differences in brightness
			 * in the entertainment configuration. Value cannot be 0, writing 0 changes it to lowest possible value.
			 */
			equalization_factor: number
		}[]
	},
	/**
	 * List of light services that belong to this entertainment configuration.
	 * @deprecated Resolve via entertainment services in locations object
	 */
	light_services?: ResourceIdentifier<"light">[]
}

export interface EntertainmentConfigurationSet extends Partial<Omit<EntertainmentConfigurationCreate, "locations">>
{
	/**
	 * If status is “inactive” -> write start to start streaming. Writing start when it's already active does not change
	 * the owership of the streaming. If status is “active” -> write “stop” to end the current streaming. In order to
	 * start streaming when other application is already streaming first write “stop” and then “start”
	 */
	action?: EntertainmentConfigurationAction,
	/** Entertainment services of the lights that are in the zone have locations */
	locations?:
	{
		service_locations:
		{
			service: ResourceIdentifier<"entertainment">,
			/** Describes the location of the service. */
			positions: EntertainmentChannelPosition[],
			/**
			 * Relative equalization factor applied to the entertainment service, to compensate for differences in brightness
			 * in the entertainment configuration. Value cannot be 0, writing 0 changes it to lowest possible value.
			 */
			equalization_factor?: number
		}
	}
}

export interface EntertainmentConfigurationCreate
{
	metadata:
	{
		/** Friendly name of the entertainment configuration */
		name: string
	},
	/**
	 * Defines for which type of application this channel assignment was optimized for
	 * * "screen": Channels are organized around content from a screen
	 * * "monitor": Channels are organized around content from one or several monitors
	 * * "music": Channels are organized for music synchronization
	 * * "3dspac": Channels are organized to provide 3d spacial effects
	 * * "other": General use case
	 */
	configuration_type: EntertainmentConfigurationType,
	stream_proxy?:
	{
		/**
		 * Proxymode used for this group
		 * * auto – The bridge will select a proxynode automatically.
		 * * manual – The proxynode has been set manually
		 */
		mode: EntertainmentConfigurationStreamMode,
		/**
		 * Reference to the device acting as proxy The proxynode relays the entertainment traffic and should be located
		 * in or close to all entertainment lamps in this group. The proxynode set by the application (manual) resp
		 * selected by the bridge (auto). Writing sets proxymode to “manual”. Is not allowed to be combined with attribute
		 * “proxymode”:”auto” Can be type BridgeDevice or ZigbeeDevice
		 */
		node?: ResourceIdentifier<"entertainment">
	},
	/** Entertainment services of the lights that are in the zone have locations */
	locations:
	{
		service_locations:
		{
			service: ResourceIdentifier<"entertainment">,
			/** Describes the location of the service. */
			positions: EntertainmentChannelPosition[]
		}
	}
}
