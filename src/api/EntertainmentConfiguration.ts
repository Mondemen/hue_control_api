import { UUID } from "crypto";
import { dtls } from "node-dtls-client";
import { inspect } from "util";
import { PartialDeep } from "../../types/utils";
import Channel from "../lib/Channel";
import ExtError from "../lib/error";
import Light from "./device/Light";
import LightStream, { LightStreamInternal } from "./device/LightStream";
import LightStreamCustom from "./device/LightStreamCustom";
import Resource, { ResourceEvents } from "./Resource";
import EntertainmentService from "./service/EntertainmentService";
import LightService from "./service/LightService";
import { EntertainmentConfigurationCreate, EntertainmentConfigurationGet, EntertainmentConfigurationSet, EntertainmentConfigurationStatus, EntertainmentConfigurationStreamMode, EntertainmentConfigurationType } from "./types/entertainment_configuration";
import { PartialResource, ResourceIdentifier, ResourceType } from "./types/resource";

export interface StreamContext
{
	[key: string]: any,
	framesPerSecond: number
}

export interface EntertainmentConfigurationEvents extends ResourceEvents
{
	name: (name: string) => void;
	configuration_type: (type: EntertainmentConfigurationType) => void;
	status: (status: EntertainmentConfigurationStatus) => void;
	stream_proxy_mode: (mode: EntertainmentConfigurationStreamMode) => void;
	stream_proxy_node: (node?: EntertainmentService) => void;
}

export default class EntertainmentConfiguration extends Resource
{
	protected toUpdate: EntertainmentConfigurationSet = {};
	protected toCreate: PartialDeep<EntertainmentConfigurationCreate> = {};

	protected type: ResourceType = "entertainment_configuration";

	private streamLoop?: NodeJS.Timeout | number;
	private streamSocket?: dtls.Socket;

	private name: string;
	private configurationType: EntertainmentConfigurationType;
	private status: EntertainmentConfigurationStatus;
	private streamProxyMode: EntertainmentConfigurationStreamMode;
	private streamProxyNode: ResourceIdentifier<"entertainment">;
	private channels: Map<number, Channel> = new Map();
	private lightStreams: LightStreamInternal[] = [];
	private customLights: Map<UUID, {light: Light, intervalDelay?: number}> = new Map();
	private customLightUpdateQueue: Map<UUID, Promise<void>> = new Map();

	protected setData(data: PartialResource<EntertainmentConfigurationGet>)
	{
		super.setData(data);
		if (data.metadata?.name && this.name !== data.metadata.name)
			this.emit("name", this.name = data.metadata.name);
		else if (data.name && this.name !== data.name)
			this.emit("name", this.name = data.name);
		if (data.configuration_type && this.configurationType !== data.configuration_type)
			this.emit("configuration_type", this.configurationType = data.configuration_type);
		if (data.status && this.status !== data.status)
			this.emit("status", this.status = data.status);
		if (data.stream_proxy?.mode && this.streamProxyMode !== data.stream_proxy.mode)
			this.emit("stream_proxy_mode", this.streamProxyMode = data.stream_proxy.mode);
		if (data.stream_proxy?.node && this.streamProxyNode !== data.stream_proxy.node)
			this.emit("stream_proxy_node", this.registry.resources.entertainment.get((this.streamProxyNode = data.stream_proxy.node)?.rid));
		data.channels?.forEach(channel =>
		{
			if (!this.channels.has(channel.channel_id))
				this.channels.set(channel.channel_id,  new Channel(this.registry, this));
			Channel.setData(this.channels.get(channel.channel_id), channel);
		});
		this.channels.forEach(channel =>
		{
			if (data.channels && !data.channels.find(c => channel.getID() === c.channel_id))
				this.channels.delete(channel.getID());
		});
		if (data.channels)
			this.refreshLightStreams();
	}

	emit<T extends keyof EntertainmentConfigurationEvents>(eventName: T, ...args: Parameters<EntertainmentConfigurationEvents[T]>) {super.emit<any>(eventName, ...args)}
	on<T extends keyof EntertainmentConfigurationEvents>(eventName: T, listener: EntertainmentConfigurationEvents[T]) {return (super.on<any>(eventName, listener))}
	once<T extends keyof EntertainmentConfigurationEvents>(eventName: T, listener: EntertainmentConfigurationEvents[T]) {return (super.once<any>(eventName, listener))}
	off<T extends keyof EntertainmentConfigurationEvents>(eventName: T, listener: EntertainmentConfigurationEvents[T]) {super.off<any>(eventName, listener)}
	removeAllListeners<T extends keyof EntertainmentConfigurationEvents>(eventName: T) {return (super.removeAllListeners<any>(eventName))}

	/**
	 * Get scene name
	 */
	getName()
	{return ((this.exists ? this.toUpdate.metadata?.name : this.toCreate.metadata?.name) ?? this.name)}

	setName(name: string)
	{
		if (this.exists)
		{
			this.toUpdate.metadata ??= {name};
			this.toUpdate.metadata.name = name;
			this.updatable = true;
		}
		else
		{
			this.toCreate.metadata ??= {};
			this.toCreate.metadata.name = name;
			this.creatable = true;
		}
		return (this);
	}

	getConfigurationType()
	{return ((this.exists ? this.toUpdate.configuration_type : this.toCreate.configuration_type) ?? this.configurationType)}

	setConfigurationType(type: EntertainmentConfigurationType)
	{
		if (this.exists)
		{
			this.toUpdate.configuration_type = type;
			this.updatable = true;
		}
		else
		{
			this.toCreate.configuration_type = type;
			this.creatable = true;
		}
		return (this);
	}

	getStatus()
	{return (this.status)}

	getProxyMode()
	{return ((this.exists ? this.toUpdate.stream_proxy?.mode : this.toCreate.stream_proxy?.mode) ?? this.streamProxyMode)}

	getProxyNode()
	{
		const node = (this.exists ? this.toUpdate.stream_proxy?.node : this.toCreate.stream_proxy?.node as ResourceIdentifier<"entertainment">) ?? this.streamProxyNode;

		if (this.registry.resources.entertainment.has(node.rid))
			return (this.registry.resources.entertainment.get(node.rid) as EntertainmentService);
		throw new ExtError("Proxy must exist but not found in bridge");
	}

	setProxyNode(node: "auto" | number | Light | LightService | EntertainmentService)
	{
		if (this.exists)
		{
			this.toUpdate.stream_proxy ??= {mode: "manual"};
			this.toUpdate.stream_proxy.mode = "manual";
			if (typeof node === "number")
				this.toUpdate.stream_proxy.node = this.channels.get(node)?.members.at(0)?.service;
			else if (node instanceof Light)
				this.toUpdate.stream_proxy.node = node.entertainmentService;
			else if (node instanceof LightService)
				this.toUpdate.stream_proxy.node = node.getOwner().entertainmentService;
			else if (node instanceof EntertainmentService)
				this.toUpdate.stream_proxy.node = node.ref;
			else
				this.toUpdate.stream_proxy.node = undefined;
			if (!this.toUpdate.stream_proxy.node)
				this.toUpdate.stream_proxy.mode = "auto";
			this.updatable = true;
		}
		else
		{
			this.toCreate.stream_proxy ??= {mode: "manual"};
			this.toCreate.stream_proxy.mode = "manual";
			if (typeof node === "number")
				this.toCreate.stream_proxy.node = this.channels.get(node)?.members.at(0)?.service;
			else if (node instanceof Light)
				this.toCreate.stream_proxy.node = node.entertainmentService;
			else if (node instanceof LightService)
				this.toCreate.stream_proxy.node = node.getOwner().entertainmentService;
			else if (node instanceof EntertainmentService)
				this.toCreate.stream_proxy.node = node.ref;
			else
				this.toCreate.stream_proxy.node = undefined;
			if (!this.toCreate.stream_proxy.node)
				this.toCreate.stream_proxy.mode = "auto";
			this.creatable = true;
		}
	}

	getChannel(light: number | Light | LightService | EntertainmentService)
	{
		if (typeof light === "number")
			return (this.channels.get(light));
		else if (light instanceof Light)
			return (this.channels.find(channel => channel.members.find(member => member.service.rid === light.entertainmentService?.rid)));
		else if (light instanceof LightService)
			return (this.channels.find(channel => channel.members.find(member => member.service.rid === light.getOwner().entertainmentService?.rid)));
		else if (light instanceof EntertainmentService)
			return (this.channels.find(channel => channel.getService() === light));
	}

	getChannels()
	{return (this.channels.array())}

	/**
	 * ⚠⚠⚠    USE AT YOUR OWN RISK!    ⚠⚠⚠
	 *
	 * Allows you to add lights outside of this configuration, or not Hue certified, they will not be saved on the
	 * bridge but only accessible on this instance.
	 *
	 * These added lights will not work with the Hue Entertainment system but can be used in the start() rendering callback,
	 * however, the refresh of these lights will be limited to 4 frames per second by default for performance reasons.
	 *
	 * You can define the refresh interval delay in arguments (in milliseconds)
	 */
	addCustomLight(light: Light, intervalDelay?: number)
	{
		this.customLights.set(light.getID(), {light, intervalDelay});
		this.refreshLightStreams();
		return (this);
	}

	deleteCustomLight(light: Light)
	{
		this.customLights.delete(light.getID());
		this.refreshLightStreams();
		return (this);
	}

	private refreshLightStreams()
	{
		this.lightStreams = [];
		this.channels.forEach(channel =>
		{
			const light = channel.getService().getLight();

			if (light)
				this.lightStreams.push(new LightStreamInternal(channel.getID(), light));
		});
		this.customLights.forEach(light => this.lightStreams.push(new LightStreamCustom(-1, light.light, light.intervalDelay)));
	}

	getLightStreams(): LightStream[]
	{return (this.lightStreams)}

	async create()
	{
		if (this.exists)
			throw new ExtError(1);
		if (this.creatable)
		{
			// this.toCreate = await sceneCreate.validate(this.toCreate);
			await super.create();
		}
	}

	async delete()
	{
		if (this.exists)
			await this.registry.delete(this);
	}

	async update()
	{
		if (this.updatable)
		{
			// this.toUpdate = await sceneUpdate.validate(this.toUpdate);
			console.log("UPDATE SCENE", inspect(this.toUpdate, false, null, true));
			await this.registry.update(this, this.toUpdate);
		}
	}

	private getStreamMessage(lights: LightStreamInternal[])
	{
		const entertainmentConfigurationId = Buffer.from(this.id, "ascii");
		const protocolName = Buffer.from("HueStream", "ascii");
		const restOfHeader = Buffer.from(
		[
			0x02, 0x00, /* Streaming API version 2.0 */
			0x01, /* sequence number 1 (This is currently not used by the Hue Hub) */
			0x00, 0x00, /* Reserved - just fill with 0's */
			0x01, /* set 0x00 for RGB color mode or set 0x01 for xy + brightness mode */
			0x00, /* Reserved - just fill with 0's */
		]);

		return (Buffer.concat(
		[
			new Uint8Array(protocolName),
			new Uint8Array(restOfHeader),
			new Uint8Array(entertainmentConfigurationId),
			...lights.filter(light => light.getChannelID() >= 0).map(light =>
			{
				const color = light.color ?? {x: 0, y: 0};
				const x = Math.min(Math.max(Math.round(color.x * 0xFF), 0), 0xFF) >>> 0;
				const y = Math.min(Math.max(Math.round(color.y * 0xFF), 0), 0xFF) >>> 0;
				const b = Math.min(Math.max(Math.round(((light.brightness ?? 0) / 100) * 0xFF), 0), 0xFF) >>> 0;

				return (new Uint8Array(Buffer.from(
				[
					light.getChannelID(),
					x, x,
					y, y,
					b, b
				])));
			})
		]));
	}

	private addCustomLightUpdate(light: LightStreamCustom)
	{
		return (new Promise((resolve, reject) =>
		{
			if (!this.customLightUpdateQueue.has(light.getID()))
				this.customLightUpdateQueue.set(light.getID(), Promise.resolve());
			this.customLightUpdateQueue.set(light.getID(), (this.customLightUpdateQueue.get(light.getID()) as Promise<void>).then(async () => await light.update()).then(resolve).catch(reject));
		}));
	}

	async start(frameCallback?: (lights: LightStream[], frame: number, framesPerSecond: number) => unknown, framesPerSecond = 50)
	{
		let frame = 0;

		if (!this.exists)
			await this.create();
		await this.registry.update(this, {action: "start"} satisfies EntertainmentConfigurationSet);
		this.streamSocket = await this.registry.startEntertainment();
		this.streamSocket.on("close", () => this.stop());
		this.streamLoop = setInterval(() =>
		{
			frameCallback?.(this.lightStreams, frame, framesPerSecond);
			this.lightStreams.forEach(light => light.startSequence(frame, framesPerSecond))
			this.streamSocket?.send(this.getStreamMessage(this.lightStreams as LightStreamInternal[]));
			this.lightStreams.filter(light => light instanceof LightStreamCustom).forEach((light: LightStreamCustom) => this.addCustomLightUpdate(light));
			frame++;
		}, Math.round(1000 / framesPerSecond));
		return (this.lightStreams);
	}

	async stop()
	{
		if (!this.exists)
			await this.create();
		if (this.streamLoop !== undefined)
		{
			clearInterval(this.streamLoop);
			this.streamLoop = undefined;
		}
		await this.registry.update(this, {action: "stop"} satisfies EntertainmentConfigurationSet);
	}
}
