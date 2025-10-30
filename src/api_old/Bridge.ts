import MotionSensor from "./accessory/MotionSensor";
import Switch from "./accessory/Switch";
import Device from "./Device";
import Light from "./light/Light";
import Bulb from "./light/Bulb";
import Plug from "./light/Plug";
import ColorBulb from "./light/ColorBulb";
import WhiteAmbianceBulb from "./light/WhiteAmbianceBulb";
import WhiteAndColorBulb from "./light/WhiteAndColorBulb";
import WhiteBulb from "./light/WhiteBulb";
import Resource from "./Resource";
import BridgeService, { EventCallbacks as EventCallbacksBrightService } from "./service/BridgeService";
import ButtonService from "./service/ButtonService";
import RelativeRotaryService from "./service/RelativeRotaryService";
import DevicePowerService from "./service/DevicePowerService";
import GroupedLightService from "./service/GroupedLightService";
import LightLevelService from "./service/LightLevelService";
import LightService from "./service/LightService";
import MotionService from "./service/MotionService";
import Service from "./service/Service";
import TemperatureService from "./service/TemperatureService";
import ZGPConnectivityService from "./service/ZGPConnectivityService";
import ZigbeeConnectivityService from "./service/ZigbeeConnectivityService";
import ZigbeeDeviceDiscoveryService from "./service/ZigbeeDeviceDiscoveryService";
import Group from "./group/Group";
import Room from "./group/Room";
import Zone from "./group/Zone";
import BridgeHome from "./group/BridgeHome";
import ExtError from "../lib/error";
import Request, { HTTPResponse } from "../lib/Request";
import Connector, { HueBridgeRemoteInfo, HueBridgeRemoteToken } from "../lib/Connector";
import {EventCallbacks as EventCallbacksParent} from './Device';
import Scene from "./Scene";
import SmartScene from "./SmartScene";
import Accessory from "./accessory/Accessory";

export interface EventCallbacks extends EventCallbacksParent, EventCallbacksBrightService
{
	connected: () => void,
	disconnected: () => void,
	connection_error: (error: Error) => void,
	refresh_token: (refresh_token: string) => void,
	add_device: (device: Device) => void,
	delete_device: (device: Device) => void,
	add_light: (light: Light) => void,
	delete_light: (light: Light) => void,
	add_scene: (scene: Scene | SmartScene) => void,
	delete_scene: (scene: Scene | SmartScene) => void,
	add_accessory: (accessory: Accessory) => void,
	delete_accessory: (accessory: Accessory) => void,
}

export default class Bridge extends Device
{
	/**
	 * State of connection
	 *
	 * @enum {string}
	 * @readonly
	 */
	static State =
	{
		CONNECTING: "CONNECTING",
		OPEN: "OPEN",
		CLOSED: "CLOSED"
	}

	get Object()
	{
		return (
		{
			MotionSensor,
			Switch,
			Device,
			Light,
			Bulb,
			Plug,
			ColorBulb,
			WhiteAmbianceBulb,
			WhiteAndColorBulb,
			WhiteBulb,
			Resource,
			BridgeService,
			ButtonService,
			RelativeRotaryService,
			DevicePowerService,
			GroupedLightService,
			LightLevelService,
			LightService,
			MotionService,
			Service,
			TemperatureService,
			ZGPConnectivityService,
			ZigbeeConnectivityService,
			ZigbeeDeviceDiscoveryService,
			Group,
			Room,
			Zone,
			BridgeHome,
			Scene,
			SmartScene
		})
	}

	_baseURL: string;
	_appKey: string;
	remoteAccess?: HueBridgeRemoteInfo;
	private _connector: Connector;
	private _connected = false;
	private _consumeEvents = false;
	// private _streamEnabled = false;
	private _stream: Request;
	private _bridgeData: BridgeService;
	private _bridgeHome: BridgeHome;
	private _deviceDiscoverer: ZigbeeDeviceDiscoveryService;
	private _connectivity;
	private _entertainment;
	private _service = {};
	private _request: typeof Request;

	/**
	 * Object represents Philips Hue bridge
	 */
	constructor(baseURL: string, appKey: string, remoteAccess: HueBridgeRemoteInfo | undefined | null, connector: Connector)
	{
		super();
		if (!baseURL)
			throw new ExtError("No base URL defined");
		if (!appKey)
			throw new ExtError("No application key defined");
		if (!connector)
			throw new ExtError("No connector has been defined");
		this._baseURL = baseURL;
		this._appKey = appKey;
		if (remoteAccess)
			this.remoteAccess = remoteAccess;
		this._request = (connector as any)._request;
		this._connector = connector;
	}

	isConnected()
	{return (this._connected)}

	isConsumeEvents()
	{return (this._consumeEvents)}

	request(url: string)
	{return(new this._request(url))};

	/**
	 * Add bridge service
	 */
	protected _addService(service: BridgeService)
	{
		super._addService(service);
		if (service instanceof BridgeService)
			this._bridgeData = service;
	}

	private _streamEvent()
	{
		let baseURL = this._baseURL;
		let resourceObj: Resource;

		if (this.remoteAccess)
			baseURL += "/route";
		this._stream = this.request(`https://${baseURL}/eventstream/clip/v2`);
		this._stream.setHeader("Accept", "application/json");
		this._stream.setHeader("hue-application-key", this._appKey);
		if (this.remoteAccess)
			this._stream.setHeader("Authorization", `Bearer ${this.remoteAccess.access_token}`);
		else
			this._stream.setStrictSSL(false);
		this._stream.connect();
		this._stream.on("open", () =>
		{
			this._connected = true;
			this._consumeEvents = true;
			this.emit("connected");
		});
		this._stream.on("data", (data: any) =>
		{
			JSON.parse(data).forEach((event: any) =>
			{
				switch (event.type.toLowerCase())
				{
					case "update":
					{
						event.data.forEach(resource =>
						{
							if (!this._resources[`${resource.type}/${resource.id}`])
								return;
							resourceObj = this._resources[`${resource.type}/${resource.id}`];
							resourceObj._eventStart();
							resourceObj._setData(resource);
							resourceObj.emit("update", resource);
						})
						break;
					}
					case "add":
					{
						this.addResources(event);
						break;
					}
					case "delete":
					{
						event.data.forEach(resource =>
						{
							if (!this._resources[`${resource.type}/${resource.id}`])
								return;
							this._resources[`${resource.type}/${resource.id}`].alive = false;
						})
						this.deleteResources();
						break;
					}
					default:
					{
						console.log("UNSUPPORTED EVENT", event);
						break;
					}
				}
			})
			this._eventEnd(this);
		});
		this._stream.on("error", error =>
		{
			this.emit("connection_error", error);
			if (this._connected)
				this.emit("disconnected");
			this._connected = false;
			this._consumeEvents = false;
			this._stream?.close?.();
			this._streamEvent();
		});
	}

	emit<T extends keyof EventCallbacks>(eventName: T, ...args: Parameters<EventCallbacks[T]>) {return (super.emit<any>(eventName, ...args))}
	on<T extends keyof EventCallbacks>(eventName: T, listener: EventCallbacks[T]) {return (super.on<any>(eventName, listener))}
	once<T extends keyof EventCallbacks>(eventName: T, listener: EventCallbacks[T]) {return (super.once<any>(eventName, listener))}
	removeAllListeners<T extends keyof EventCallbacks>(eventName: T) {return (super.removeAllListeners<any>(eventName))}

	// async _streamEventV1(once = true)
	// {
	// 	let url = `https://${this._baseURL}/api/${this._appKey}${this.getOldID()}`;
	// 	let groups = {}, groupedLightServices = {}, lightServices = {};

	// 	if (!this._streamEnabled)
	// 		return;
	// 	try
	// 	{
	// 		resources = (await this.request(`${url}`).get().setStrictSSL(false).setHeader("Accept", "application/json").execute()).data;
	// 		this._connected = true;
	// 		Object.values(this._resources.service).forEach(service =>
	// 		{
	// 			if (service instanceof GroupedLightService)
	// 				groupedLightServices[service.getOldID()] = service;
	// 			else if (service instanceof LightService)
	// 				lightServices[service.getOldID()] = service;
	// 		})
	// 		groups = Object.values(this._resources.group).reduce((result, group) => {result[group.getOldID()] = group; return (result)}, {});
	// 		Object.entries(resources.groups).forEach(([id, group]) =>
	// 		{
	// 			id = `/groups/${id}`;
	// 			if (groups[id])
	// 				groups[id]._setData(groups[id].convertOldData(id, group, {groupedLightServices, lightServices}), true);
	// 			if (groupedLightServices[id])
	// 				groupedLightServices[id]._setData(groupedLightServices[id].convertOldData(id, group, {groupedLightServices, lightServices}), true);
	// 		})
	// 	}
	// 	catch (error)
	// 	{
	// 		this.emit("connection_error", error);
	// 		if (this._connected)
	// 			this.emit("disconnected");
	// 		this._connected = false;
	// 	}
	// 	finally
	// 	{
	// 		if (this._streamEnabled && !once)
	// 			setTimeout(() => this._streamEventV1(), 1000);
	// 	}
	// }

	async refreshToken()
	{
		let refreshToken: HueBridgeRemoteToken;

		if (!this.remoteAccess || new Date(this.remoteAccess.expires_at).getTime() > Date.now())
			return;
		refreshToken = await this._connector.getRefreshToken(this.remoteAccess);
		this.remoteAccess = {...this.remoteAccess, ...refreshToken};
		this.emit("refresh_token", refreshToken.refresh_token);
	}

	async connect()
	{
		let result;

		if (this._connected)
			return (true);
		result = await this.refreshResources();
		this._streamEvent();
		this._connected = true;
		return (result);
	}

	close()
	{
		if (!this._connected)
			return;
		// this._streamEnabled = false;
		this._stream?.close?.();
		this._connected = false;
		this._consumeEvents = true;
		this.emit("disconnected");
	}

	async refreshResources()
	{
		let baseURL: string;
		let req: Request, result: HTTPResponse;

		baseURL = this._baseURL;
		try
		{
			if (this.remoteAccess)
			{
				baseURL += "/route";
				await this.refreshToken();
			}
			req = this.request(`https://${baseURL}/clip/v2/resource`);
			req.setHeader("Accept", "application/json");
			req.setHeader("hue-application-key", this._appKey);
			if (this.remoteAccess)
				req.setHeader("Authorization", `Bearer ${this.remoteAccess.access_token}`);
			else
				req.setStrictSSL(false);
			result = await req.execute();
			if (result.statusCode !== 200)
				throw new Error(result.statusMessage);
			this.addResources(result.data);
			for (const id in this._resources)
				if (!result.data.data.find((resource: any) => `${resource.type}/${resource.id}` === this._resources[id]._id))
					this._resources[id].alive = false;
			this.deleteResources();
			this._connected = true;
			return (true);
		}
		catch (error)
		{
			this.emit("connection_error", error);
			return (false);
		}
	}

	private addResources(resources: any)
	{
		let types: Record<string, string[]> = {};
		let devices, groups, scenes, smartScenes, services;

		types.devices = ["device"];
		types.groups = ["zone", "room", "bridge_home"];
		types.scenes = ["scene"];
		types.smartScenes = ["smart_scene"];

		try
		{
			devices = resources.data.filter(device => types.devices.includes(device.type.toLowerCase()));
			groups = resources.data.filter(group => types.groups.includes(group.type.toLowerCase()));
			scenes = resources.data.filter(device => types.scenes.includes(device.type.toLowerCase()));
			smartScenes = resources.data.filter(device => types.smartScenes.includes(device.type.toLowerCase()));
			services = resources.data.filter(service => !Object.values(types).flat().includes(service.type.toLowerCase()));
			// console.log("--- LOAD DEVICE");
			devices?.forEach?.(resource => this.setResource(resource, services));
			// console.log("--- LOAD GROUP");
			groups?.forEach?.(resource => this.setResource(resource, services));
			scenes?.forEach?.(resource => this.setResource(resource, services));
			smartScenes?.forEach?.(resource => this.setResource(resource, services));
			services?.forEach?.(resource => this.setResource(resource, services));
		}
		catch (error)
		{
			console.log("ERROR", error);
		}
	}

	deleteResources()
	{
		for (const id in this._resources)
		{
			if (!this._resources[id].alive)
			{
				this._resources[id]._delete();
				delete this._resources[id];
			}
		}
	}

	setResource(data, list)
	{
		let resource: Resource | undefined;
		let service: Service;
		let group: Group | undefined;
		let mappingServices = (data, index) =>
		{
			let service: Resource | undefined;
			let uid = `${data.rtype}/${data.rid}`;

			index = list.findIndex(data => `${data.type}/${data.id}` === uid);
			data = (index >= 0) ? list.splice(index, 1)[0] : data;
			if (!this._resources[uid])
			{
				switch (data.type ?? data.rtype)
				{
					case Resource.Type.BRIDGE:
						service = new BridgeService(this); break;
					case Resource.Type.LIGHT:
						service = new LightService(this); break;
					case Resource.Type.ZIGBEE_CONNECTIVITY:
						service = new ZigbeeConnectivityService(this); break;
					case Resource.Type.ZGP_CONNECTIVITY:
						service = new ZGPConnectivityService(this); break;
					case Resource.Type.ZIGBEE_DEVICE_DISCOVERY:
						service = this._deviceDiscoverer =  new ZigbeeDeviceDiscoveryService(this); break;
					case Resource.Type.MOTION:
						service = new MotionService(this); break;
					case Resource.Type.DEVICE_POWER:
						service = new DevicePowerService(this); break;
					case Resource.Type.LIGHT_LEVEL:
						service = new LightLevelService(this); break;
					case Resource.Type.TEMPERATURE:
						service = new TemperatureService(this); break;
					case Resource.Type.BUTTON:
						service = new ButtonService(this); break;
					case Resource.Type.GROUPED_LIGHT:
						service = new GroupedLightService(this); break;
					case Resource.Type.RELATIVE_ROTARY:
						service = new RelativeRotaryService(this); break;
					// default:
					// 	service = new Service(this); break;
				}
				if (service)
					this._resources[uid] = service;
			}
			else
				service = this._resources[uid];
			if (data.type && service)
			{
				service._setData(data);
				if (!service._init)
					service._add();
			}
			return (service);
		}

		// console.log("TYPE", data.type);
		switch (data.type)
		{
			case Resource.Type.DEVICE:
			{
				data.services = data.services?.map(mappingServices).filter(Boolean);
				if (this._resources[`device/${data.id}`])
					resource = this._resources[`device/${data.id}`];
				else if ((service = data.services.find((service: Service) => service instanceof BridgeService)) && service instanceof BridgeService)
				{
					resource = this;
					this._addService(service);
				}
				else if ((service = data.services.find((service: Service) => service instanceof LightService)) && service instanceof LightService)
				{
					if (this.getLight(data.id))
						resource = this.getLight(data.id);
					else if ([...service.getCapabilities().values()].every(capability => ["state"].includes(capability)))
						resource = new Plug(this);
					else if ([...service.getCapabilities().values()].every(capability => ["state", "dimming", "effect"].includes(capability)))
						resource = new WhiteBulb(this);
					else if ([...service.getCapabilities().values()].every(capability => ["state", "dimming", "color_temperature", "effect"].includes(capability)))
						resource = new WhiteAmbianceBulb(this);
					else if ([...service.getCapabilities().values()].every(capability => ["state", "dimming", "color_temperature", "color", "effect"].includes(capability)))
						resource = new WhiteAndColorBulb(this);
					else if ([...service.getCapabilities().values()].every(capability => ["state", "dimming", "color", "effect"].includes(capability)))
						resource = new ColorBulb(this);
					else
						resource = new Light(this);
				}
				else if ((service = data.services.find((service: Service) => service instanceof MotionService)))
				{
					if (!(resource = this.getMotionSensor(data.id)))
						resource = new MotionSensor(this);
				}
				else if ((service = data.services.find((service: Service) => service instanceof ButtonService)))
				{
					if (!(resource = this.getSwitch(data.id)))
						resource = new Switch(this);
				}
				else
					resource = new Device(this);
				if (resource)
				{
					resource._setData(data);
					if (!resource._init)
						resource._add();
					if (!(resource instanceof Bridge))
						this._resources[resource._id] ??= resource;
				}
				break;
			}
			case Resource.Type.ZONE:
			case Resource.Type.ROOM:
			case Resource.Type.BRIDGE_HOME:
			{
				resource = this.getGroup(data.id);

				console.log("GROUP", data.children);
				data.services = data.services?.map?.(mappingServices).filter(Boolean);
				data.children = data.children?.map?.(mappingServices).filter(Boolean);
				// console.log("!!!! GROUP EXIST ?", group);
				if (!resource)
				{
					if (data.type === Resource.Type.ROOM)
						resource = new Room(this);
					else if (data.type === Resource.Type.ZONE)
						resource = new Zone(this);
					else if (data.type === Resource.Type.BRIDGE_HOME)
						resource = this._bridgeHome ??= new BridgeHome(this);
					else
						resource = new Group(this);
				}
				resource._setData(data);
				console.log("ADD GROUP", data.type, data.metadata, resource._id, !!this._resources[resource._id], resource);
				if (!resource._init)
					resource._add();
				this._resources[resource._id] ??= resource;
				console.log("NEW GROUPE ?", resource._id, this._resources[resource._id]);
				console.log("ALREADY EXISTS", resource._id, this._resources[resource._id]);
				console.log();
				break;
			}
			case Resource.Type.SCENE:
			{
				group = this.getGroup(data.group.rid);
				if (!(resource = this.getScene(data.id)))
					resource = new Scene(this);
				resource._setData(data);
				if (resource instanceof Scene && group)
					resource._setGroup(group);
				// console.log("--GROUP", group);
				group?._addScene(resource as any);
				if (!resource._init)
					resource._add();
				this._resources[resource._id] ??= resource;
				break;
			}
			case Resource.Type.SMART_SCENE:
			{
				group = this.getGroup(data.group.rid);
				if (!(resource = this.getScene(data.id)))
					resource = new SmartScene(this);
				resource._setData(data);
				if (resource instanceof SmartScene && group)
					resource._setGroup(group);
				group?._addScene(resource as any);
				if (!resource._init)
					resource._add();
				this._resources[resource._id] ??= resource;
				break;
			}
			// default:
			// {
			// 	resource = new Resource(this, data);
			// 	console.log("ADD DEFFAULT", data);
			// 	this._resources[resource._id] ??= resource;
			// 	break;
			// }
		}
	}

	getState()
	{return (this._stream.getState())}

	bridgeHome()
	{return (this._bridgeHome)}

	deviceDiscoverer()
	{return (this._deviceDiscoverer)}

	/**
	 * Returns the bridge ID
	 *
	 * @returns {string}
	 */
	getBridgeID(): string
	{return (this._bridgeData.getID())}

	/**
	 * Gets the list of light
	 */
	getLights()
	{return (Object.values(this._resources).filter(resource => resource instanceof Light) as Light[])}

	/**
	 * Gets light from ID
	 */
	getLight(id: string)
	{
		const light = this._resources[`device/${id}`];

		if (light instanceof Light)
			return (light);
	}

	/**
	 * Gets the list of motion sensor
	 */
	getMotionSensors()
	{return (Object.values(this._resources).filter(resource => resource instanceof MotionSensor) as MotionSensor[])}

	/**
	 * Gets motion sensor from ID
	 */
	getMotionSensor(id: string)
	{return (this._resources[`device/${id}`] as MotionSensor)}

	/**
	 * Gets the list of switch
	 */
	getSwitches()
	{return (Object.values(this._resources).filter(resource => resource instanceof Switch) as Switch[])}

	/**
	 * Gets switch from ID
	 */
	getSwitch(id: string)
	{return (this._resources[`device/${id}`] as Switch)}

	/**
	 * Gets the list of group
	 */
	getGroups()
	{return (Object.values(this._resources).filter(resource => resource instanceof Group) as Group[])}

	/**
	 * Gets group from ID
	 */
	getGroup(id: string)
	{
		const group = this._resources[`room/${id}`] ?? this._resources[`zone/${id}`];

		if (group instanceof Group)
			return (group);
	}

	 /**
	 * Gets the list of scene
	 */
	getScenes()
	{return (Object.values(this._resources).filter(resource => resource instanceof Scene || resource instanceof SmartScene))}

	/**
	 * Gets scene from ID
	 */
	getScene(id: string)
	{return (this._resources[`scene/${id}`] as Scene | SmartScene)}

	describe()
	{
		this.getGroups().forEach(group =>
		{
			console.log(`${group.getName()} (${group.getObjectType()}) :`);
			console.log(`    - Scenes (${group.getScenes().length} element(s))`);
			group.getScenes().forEach(scene => console.log(`         - ${scene.getName()}`))
			console.log(`    - Devices (${group.getDevices().length} element(s))`);
			group.getDevices().forEach(device => console.log(`         - ${device.getName()} (${device.getObjectType()})`))
			console.log();
		})
	}
}
