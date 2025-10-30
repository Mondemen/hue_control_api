import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import { UUID } from "crypto";
import { IncomingMessage } from "http";
import { Agent } from "https";
import { dtls } from "node-dtls-client";
import { PeerCertificate } from "tls";
import ExtError from "../lib/error";
import ResourceError from "../lib/error/resource";
import EventListener from "../lib/EventEmitter";
import { datetimeDeserialize, enumerable, HUE_CA_CERT } from "../utils";
import Device, { type DeviceByType, type DeviceType } from "./device";
import Bridge from "./device/Bridge";
import ContactSensor from "./device/ContactSensor";
import DialSwitch from "./device/DialSwitch";
import DimmerSwitch from "./device/DimmerSwitch";
import Light from "./device/Light";
import MotionSensor from "./device/MotionSensor";
import SmartButton from "./device/SmartButton";
import WallSwitch from "./device/WallSwitch";
import EntertainmentConfiguration from "./EntertainmentConfiguration";
import BridgeHome from "./group/BridgeHome";
import Room from "./group/Room";
import Zone from "./group/Zone";
import Resource from "./Resource";
import Scene from "./Scene";
import BellButtonService from "./service/BellButtonService";
import BridgeService from "./service/BridgeService";
import ButtonService from "./service/ButtonService";
import CameraMotionService from "./service/CameraMotion";
import ContactService from "./service/ContactService";
import DevicePowerService from "./service/DevicePowerService";
import DeviceSoftwareUpdateService from "./service/DeviceSoftwareUpdateService";
import EntertainmentService from "./service/EntertainmentService";
import GroupedLightLevelService from "./service/GroupedLightLevelService";
import GroupedLightService from "./service/GroupedLightService";
import GroupedMotionService from "./service/GroupedMotion";
import LightLevelService from "./service/LightLevelService";
import LightService from "./service/LightService";
import MotionService from "./service/MotionService";
import RelativeRotaryService from "./service/RelativeRotaryService";
import TamperService from "./service/TamperService";
import TemperatureService from "./service/TemperatureService";
import WifiConnectivityService from "./service/WifiConnectivityService";
import ZgpConnectivityService from "./service/ZgpConnectivityService";
import ZigbeeConnectivityService from "./service/ZigbeeConnectivityService";
import ZigbeeDeviceDiscoveryService from "./service/ZigbeeDeviceDiscoveryService";
import { DeviceGet } from "./types/device";
import { HueBridgeAccess, HueBridgeDiscovered, HueBridgeRemoteAccess } from "./types/registry";
import { ResourceEvent, ResourceGet, ResourcesResponseGet, ResourcesResponseSet, ResourceType } from "./types/resource";
import ConvenienceAreaMotionService from "./service/ConvenienceAreaMotionService";
import SecurityAreaMotionService from "./service/SecurityAreaMotionService";

// class RegistryError extends Error
// {
// 	// origin: "",
// 	status: number,
// 	resource?: Resource,
// 	// message: string

// }

export interface RegistryEvents
{
	error: (errors: ExtError[]) => void;
}

export default class Registry extends EventListener
{
	private backend: AxiosInstance;
	private stream?: IncomingMessage;

	private bridgeIP: string;
	private accesses: HueBridgeAccess;
	private remoteAccesses?: HueBridgeRemoteAccess | null;

	resources =
	{
		behavior_instance: new Map<UUID, Resource>(),
		behavior_script: new Map<UUID, Resource>(),
		bridge: new Map<UUID, BridgeService>(),
		bridge_home: new Map<UUID, BridgeHome>(),
		button: new Map<UUID, ButtonService>(),
		camera_motion: new Map<UUID, CameraMotionService>(),
		contact: new Map<UUID, ContactService>(),
		device_power: new Map<UUID, DevicePowerService>(),
		device_software_update: new Map<UUID, DeviceSoftwareUpdateService>(),
		device: new Map<UUID, Device>(),
		entertainment: new Map<UUID, EntertainmentService>(),
		entertainment_configuration: new Map<UUID, EntertainmentConfiguration>(),
		grouped_light_level: new Map<UUID, GroupedLightLevelService>(),
		grouped_light: new Map<UUID, GroupedLightService>(),
		grouped_motion: new Map<UUID, GroupedMotionService>(),
		light_level: new Map<UUID, LightLevelService>(),
		light: new Map<UUID, LightService>(),
		motion: new Map<UUID, MotionService>(),
		relative_rotary: new Map<UUID, RelativeRotaryService>(),
		room: new Map<UUID, Room>(),
		scene: new Map<UUID, Scene>(),
		tamper: new Map<UUID, TamperService>(),
		temperature: new Map<UUID, TemperatureService>(),
		zgp_connectivity: new Map<UUID, ZgpConnectivityService>(),
		zigbee_connectivity: new Map<UUID, ZigbeeConnectivityService>(),
		zigbee_device_discovery: new Map<UUID, ZigbeeDeviceDiscoveryService>(),
		zone: new Map<UUID, Zone>(),
	};

	constructor(bridgeIP: string, accesses: HueBridgeAccess, remoteAccesses?: HueBridgeRemoteAccess | null)
	{
		super();
		enumerable(false)(this, "_events");
		enumerable(false)(this, "_onceEvents");
		enumerable(false)(this, "backend");
		enumerable(false)(this, "stream");
		this.bridgeIP = bridgeIP;
		this.accesses = accesses;
		this.remoteAccesses = remoteAccesses;
		this.backend = axios.create();
		if (remoteAccesses)
		{
			this.backend.defaults.baseURL += "https://api.meethue.com"; // /route
			this.backend.defaults.headers.common.Authorization = `Bearer ${remoteAccesses.accessToken}`;
		}
		else
		{
			this.backend.defaults.baseURL = `https://${bridgeIP}`;
			this.backend.defaults.httpsAgent = new Agent(
			{
				ca: HUE_CA_CERT,
				checkServerIdentity: (_hostname: string, cert: PeerCertificate) =>
				{
					if (cert.subject.CN.toLowerCase() === this.accesses.bridgeID?.toLowerCase())
						return;
					return new Error("Server identity check failed. CN does not match bridgeId.");
				}
			});
		}
		this.backend.defaults.headers.common.Accept = "application/json";
		this.backend.defaults.headers.common["hue-application-key"] = accesses.appKey;
		this.backend.interceptors.response.use(value =>
		{
			if (value.config.headers.Accept === "application/json")
				value.data = JSON.parse(JSON.stringify(value.data), datetimeDeserialize);
			return (value);
		})
	}

	emit<T extends keyof RegistryEvents>(eventName: T, ...args: Parameters<RegistryEvents[T]>) {super.emit(eventName, ...args)}
	on<T extends keyof RegistryEvents>(eventName: T, listener: RegistryEvents[T]) {return (super.on(eventName, listener))}
	once<T extends keyof RegistryEvents>(eventName: T, listener: RegistryEvents[T]) {return (super.once(eventName, listener))}
	off<T extends keyof RegistryEvents>(eventName: T, listener: RegistryEvents[T]) {super.off(eventName, listener)}
	removeAllListeners<T extends keyof RegistryEvents>(eventName: T) {super.removeAllListeners(eventName)}

	private async searchBridgeID()
	{
		if (!this.accesses.bridgeID)
		{
			const response = await axios.get<HueBridgeDiscovered[]>("https://discovery.meethue.com/");
			const bridge = response.data?.find(bridge => bridge.internalipaddress === this.bridgeIP);

			this.accesses.bridgeID = bridge?.id;
		}
	}

	async streamEvents()
	{
		let result: AxiosResponse<IncomingMessage>;
		let data = "";
		let resource: Resource | undefined;

		if (this.stream || this.remoteAccesses)
			return;
		try
		{
			result = await this.backend.get<IncomingMessage>("/eventstream/clip/v2", {headers: {Accept: "text/event-stream"}, responseType: "stream"});
			this.stream = result.data;
			this.stream.on("data", (chunk: Buffer) =>
			{
				let result: ResourceEvent;
				let regex: RegExpExecArray | null;

				data += chunk.toString().replace(": hi\n", "");
				regex = /\s*id\s*:\s+(?<id>\d*:\d*)\ndata\s*:\s+(?<data>.*)\n+/gm.exec(data);
				if (!regex || (!regex.groups?.id || !regex.groups?.data))
					return;
				data = data.replace(regex[0], "");
				result =
				{
					id: regex.groups.id,
					data: JSON.parse(regex.groups.data, datetimeDeserialize)
				}
				result.data.forEach(event =>
				{
					switch (event.type)
					{
						case "add":
						case "update":
							event.data.forEach(data => this.setResource(data)); break;
						case "delete":
						{
							event.data.forEach(data =>
							{
								resource = this.resources[data.type]?.get(data.id);
								if (resource)
									resource.exists = false;
							});
							this.deleteResources();
							break;
						}
						default:
							console.log("Unknown event", event); break;
					}
				});
				// console.log("EVENT", inspect(result, false, null, true));
			});
		}
		catch (error)
		{
			console.error("Error occured during start eventing", error);
		}
	}

	async refreshResources()
	{
		let response: AxiosResponse<ResourcesResponseGet>;
		let error: AxiosError<ResourcesResponseGet>;

		await this.searchBridgeID();
		if (this.remoteAccesses)
		{
			// await this.refreshToken();
		}
		try
		{response = await this.backend.get("/clip/v2/resource")}
		catch (err)
		{
			error = err;
			if (!error.isAxiosError || !error.response?.data)
			{
				this.emit("error", [new ResourceError(101, "Error occured during get resources")]);
				return;
			}
			response = error.response;
		}
		if (response.data.errors.length)
			this.emit("error", response.data.errors.map(error => new ResourceError(101, error.description, undefined, response.status)));
		else
		{
			Object.values(this.resources).forEach(registry => registry.forEach(resource => resource.exists = false))
			for (const resource of response.data.data)
				this.setResource(resource);
			this.deleteResources();
			// console.log("DEVICES", this.resources.device);
		}
	}

	async connect()
	{
		await this.refreshResources();
		await this.streamEvents();
	}

	close()
	{
		this.stream?.removeAllListeners("data");
		this.stream = undefined;
	}

	getBridges()
	{return (this.resources.device.filter(device => device instanceof Bridge).array<Bridge>())}

	getDevices<T extends DeviceType>(type?: T): DeviceByType[T][]
	{return (this.getBridges().map(bridge => bridge.getDevices(type)).flat())}

	getEntertainmentConfigurations()
	{return (this.getBridges().map(bridge => bridge.getEntertainmentConfigurations()).flat())}

	getRooms()
	{return (this.getBridges().map(bridge => bridge.getRooms()).flat())}

	getZones()
	{return (this.getBridges().map(bridge => bridge.getZones()).flat())}

	private setResource(data: ResourceGet)
	{
		let resource: Resource | undefined;
		let deviceData: DeviceGet;

		if (this.resources[data.type]?.has(data.id))
			resource = this.resources[data.type]?.get(data.id);
		else
		{
			switch (data.type)
			{
				case "bell_button":					resource = new BellButtonService(this); break;
				case "bridge_home":					resource = new BridgeHome(this); break;
				case "bridge":						resource = new BridgeService(this); break;
				case "button":						resource = new ButtonService(this); break;
				case "camera_motion":				resource = new CameraMotionService(this); break;
				case "contact":						resource = new ContactSensor(this); break;
				case "convenience_area_motion":		resource = new ConvenienceAreaMotionService(this); break;
				case "device_power":				resource = new DevicePowerService(this); break;
				case "device_software_update":		resource = new DeviceSoftwareUpdateService(this); break;
				case "entertainment_configuration":	resource = new EntertainmentConfiguration(this); break;
				case "entertainment":				resource = new EntertainmentService(this); break;
				case "grouped_light_level":			resource = new GroupedLightLevelService(this); break;
				case "grouped_light":				resource = new GroupedLightService(this); break;
				case "grouped_motion":				resource = new GroupedMotionService(this); break;
				case "light_level":					resource = new LightLevelService(this); break;
				case "light":						resource = new LightService(this); break;
				case "motion":						resource = new MotionService(this); break;
				case "relative_rotary":				resource = new RelativeRotaryService(this); break;
				case "room":						resource = new Room(this); break;
				case "scene":						resource = new Scene(this); break;
				case "security_area_motion":		resource = new SecurityAreaMotionService(this); break;
				case "tamper":						resource = new TamperService(this); break;
				case "temperature":					resource = new TemperatureService(this); break;
				case "wifi_connectivity":			resource = new WifiConnectivityService(this); break;
				case "zgp_connectivity":			resource = new ZgpConnectivityService(this); break;
				case "zigbee_connectivity":			resource = new ZigbeeConnectivityService(this); break;
				case "zigbee_device_discovery":		resource = new ZigbeeDeviceDiscoveryService(this); break;
				case "zone":						resource = new Zone(this); break;
				case "device":
				{
					deviceData = data as DeviceGet;
					if (Bridge.is(deviceData))
						resource = new Bridge(this);
					else if (Light.is(deviceData))
						resource = new Light(this);
					else if (WallSwitch.is(deviceData))
						resource = new WallSwitch(this);
					else if (SmartButton.is(deviceData))
						resource = new SmartButton(this);
					else if (DialSwitch.is(deviceData))
						resource = new DialSwitch(this);
					else if (DimmerSwitch.is(deviceData))
						resource = new DimmerSwitch(this);
					else if (MotionSensor.is(deviceData))
						resource = new MotionSensor(this);
					else if (ContactSensor.is(deviceData))
						resource = new ContactSensor(this);
					else
						resource = new Device(this);
					break;
				}
			}
			if (resource)
				this.resources[data.type]?.set(data.id, resource);
		}
		Resource.setData(resource, data);
	}

	private deleteResources()
	{
		Object.values(this.resources).forEach(registry =>
		{
			registry?.forEach((resource, id) =>
			{
				if (!resource.exists)
				{
					resource.emit("deleted");
					registry?.delete(id);
				}
			});
		})
	}

	private async searchResource(type: ResourceType)
	{
		let response: AxiosResponse<ResourcesResponseGet>;
		let error: AxiosError<ResourcesResponseGet>;

		try
		{response = await this.backend.get(`/clip/v2/resource/${type}`)}
		catch (err)
		{
			error = err;
			if (!error.isAxiosError || !error.response?.data)
			{
				console.error(`Error occured during GET resources by type "${type}"`, error);
				return;
			}
			response = error.response;
		}
		if (response.data.errors.length)
			this.emit("error", response.data.errors.map(error => new ResourceError(101, error.description)));
		else
		{
			this.resources[type]?.forEach((resource: Resource) => resource.exists = false);
			for (const resource of response.data.data)
				this.setResource(resource);
			this.deleteResources();
		}
	}

	startEntertainment()
	{
		return (new Promise<dtls.Socket>((resolve, reject) =>
		{
			let socket: dtls.Socket;

			if (!this.accesses.clientKey)
				throw new ExtError("No clientKey");
			socket = dtls.createSocket(
			{
				type: "udp4",
				address: this.bridgeIP,
				port: 2100,
				psk: {[this.accesses.appKey]: Buffer.from(this.accesses.clientKey, 'hex') as any},
				timeout: 10000,
				ciphers: [ "TLS_PSK_WITH_AES_128_GCM_SHA256"]
			}).on("connected", () => resolve(socket)).on("error", reject)
			// subscribe events
			.on("message", (msg: any /* Buffer */) => { console.log("SOCKET MESSAGE", msg)})
		}));
	}

	async create(resource: Resource, data: any)
	{
		let response: AxiosResponse<ResourcesResponseSet>;
		let error: AxiosError<ResourcesResponseSet>;
		let createdTypes: Set<ResourceType>;

		try
		{response = await this.backend.post(`/clip/v2/resource/${resource.getType()}`, data)}
		catch (err)
		{
			error = err;
			if (!error.isAxiosError || !error.response?.data)
			{
				console.error("Error occured during POST resources", error);
				return;
			}
			response = error.response;
		}
		if (response.status === 429)
			this.emit("error", [new ResourceError(100, "Too Many Requests", resource, response.status)]);
		else if (response.data.errors?.length)
			this.emit("error", response.data.errors.map(error => new ResourceError(100, error.description, resource, response.status)));
		else
		{
			createdTypes = response.data?.data.reduce((list, ref) => list.add(ref.rtype), new Set<ResourceType>());
			Promise.all(Array.from(createdTypes).map(type => this.searchResource(type)));
		}
		return (response.data);
	}

	async update(resource: Resource, data: any)
	{
		let response: AxiosResponse<ResourcesResponseSet>;
		let error: AxiosError<ResourcesResponseSet>;
		let errors: ExtError[];
		// let createdTypes: Set<ResourceType>;

		try
		{response = await this.backend.put(`/clip/v2/resource/${resource.getType()}/${resource.getID()}`, data)}
		catch (err)
		{
			error = err;
			if (!error.isAxiosError || !error.response?.data)
			{
				console.error("Error occured during PUT resources", error);
				return;
			}
			response = error.response;
		}
		if (response.status === 429)
			this.emit("error", [new ResourceError(102, "Too Many Requests", resource, response.status)]);
		else if (response.data.errors?.length)
		{
			errors = response.data.errors.filter(error => !error.description.includes(`"soft off"`)).map(error => new ResourceError(102, error.description, resource, response.status));
			if (errors.length)
				this.emit("error", errors);
		}
		// else
		// {
		// 	createdTypes = response.data?.data.reduce((list, ref) => list.add(ref.rtype), new Set<ResourceType>());
		// 	// Promise.all(Array.from(createdTypes ?? []).map(type => this.searchResource(type)));
		// }
	}

	async delete(resource: Resource)
	{
		let response: AxiosResponse<ResourcesResponseSet>;
		let error: AxiosError<ResourcesResponseSet>;
		let createdTypes: Set<ResourceType>;

		try
		{response = await this.backend.delete(`/clip/v2/resource/${resource.getType()}/${resource.getID()}`)}
		catch (err)
		{
			error = err;
			if (!error.isAxiosError || !error.response?.data)
			{
				console.error("Error occured during DELETE resources", error);
				return;
			}
			response = error.response;
		}
		if (response.data.errors.length)
			this.emit("error", response.data.errors.map(error => new ResourceError(103, error.description, resource, response.status)));
		else
		{
			createdTypes = response.data.data.reduce((list, ref) => list.add(ref.rtype), new Set<ResourceType>());
			Promise.all(Array.from(createdTypes).map(type => this.searchResource(type)));
		}
	}
}
