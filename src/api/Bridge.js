import MotionSensor from "./accessory/MotionSensor.js";
import Switch from "./accessory/Switch.js";
import Device from "./Device.js";
import Light from "./light/Light.js";
import Bulb from "./light/Bulb.js";
import Plug from "./light/Plug.js";
import ColorBulb from "./light/ColorBulb.js";
import WhiteAmbianceBulb from "./light/WhiteAmbianceBulb.js";
import WhiteAndColorBulb from "./light/WhiteAndColorBulb.js";
import WhiteBulb from "./light/WhiteBulb.js";
import Resource from "./Resource.js";
import BridgeService from "./service/BridgeService.js";
import ButtonService from "./service/ButtonService.js";
import DevicePowerService from "./service/DevicePowerService.js";
import GroupedLightService from "./service/GroupedLightService.js";
import LightLevelService from "./service/LightLevelService.js";
import LightService from "./service/LightService.js";
import MotionService from "./service/MotionService.js";
import Service from "./service/Service.js";
import TemperatureService from "./service/TemperatureService.js";
import ZGPConnectivityService from "./service/ZGPConnectivityService.js";
import ZigbeeConnectivityService from "./service/ZigbeeConnectivityService.js";
import ZigbeeDeviceDiscoveryService from "./service/ZigbeeDeviceDiscoveryService.js";
import Group from "./group/Group.js";
import Room from "./group/Room.js";
import Zone from "./group/Zone.js";
import BridgeHome from "./group/BridgeHome.js";
import Scene from "./Scene.js";
import SmartScene from "./SmartScene.js";
import ExtError from "../lib/error/ExtError.js";

// import util from "util";
// import {createRequire} from 'module';
// const require = createRequire(import.meta.url);

/**
 * @typedef {import('../lib/Request.js').default} Request
 * @typedef {import('../lib/Connector.js').default} Connector
 * @typedef {import('./Resource.js').EventCallback} EventCallbackInherit
 */

/**
 * @callback ConnectedEvent
 * @callback DisconnectedEvent
 * @callback ConnectionErrorEvent
 * @param {Error} error - Connection error
 * @callback RefreshTokenEvent
 * @param {string} refresh_token - Refresh token for remote access
 *
 * @typedef EventCallbackTypes
 * @type {Object}
 * @property {ConnectedEvent} connected
 * @property {DisconnectedEvent} disconnected
 * @property {ConnectionErrorEvent} connection_error
 * @property {RefreshTokenEvent} refresh_token
 * @typedef {EventCallbackInherit & EventCallbackTypes} EventCallback
 */

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

	/** @private */
	_baseURL;
	/** @private */
	_appKey;
	/** @private */
	_remoteAccess;
	/** @private */
	_connector;
	/** @private */
	_connected = false;
	/** @private */
	_consumeEvents = false;
	/**
	 * @type {Request}
	 * @private
	 */
	_stream;
	/**
	 * @type {BridgeService}
	 * @private
	 */
	_bridgeData;
	/**
	 * @type {BridgeHome}
	 * @private
	 */
	_bridgeHome;
	/**
	 * @type {ZigbeeDeviceDiscoveryService}
	 * @private
	 */
	_deviceDiscoverer;
	/** @private */
	_connectivity;
	/** @private */
	_entertainment;
	/** @private */
	_service = {};
	/** @private */
	_request;
	/** @private */
	/** @type {Object<string, Resource>} */
	_resources = {};

	/**
	 * Object represents Philips Hue bridge
	 *
	 * @param {string} baseURL IP or URL of the bridge
	 * @param {string} appKey The application key
	 * @param {*} remoteAccess Remote access data
	 * @param {Connector} connector The Connector object
	 */
	constructor(baseURL, appKey, remoteAccess, connector)
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
		this._remoteAccess = remoteAccess;
		this._request = connector._request;
		this._connector = connector;
	}

	isConnected()
	{return (this._connected)}

	isConsumeEvents()
	{return (this._consumeEvents)}

	/**
	 *
	 * @param {string} url The URL of the request
	 * @returns {Request}
	 */
	request(url)
	{return(new this._request(url))};

	/**
	 * Add bridge service
	 *
	 * @private
	 * @param {BridgeService} service The bridge service
	 */
	_addService(service)
	{
		super._addService(service);
		if (service instanceof BridgeService)
			this._bridgeData = service;
	}

	/**
	 * @private
	 */
	_streamEvent()
	{
		let baseURL = this._baseURL;
		let resourceObj;

		if (this._remoteAccess)
			baseURL += "/route";
		this._stream = this.request(`https://${baseURL}/eventstream/clip/v2`);
		this._stream.setHeader("Accept", "application/json");
		this._stream.setHeader("hue-application-key", this._appKey);
		if (this._remoteAccess)
			this._stream.setHeader("Authorization", `Bearer ${this._remoteAccess.access_token}`);
		else
			this._stream.setStrictSSL(false);
		this._stream.connect();
		this._stream.on("open", () =>
		{
			this._connected = true;
			this._consumeEvents = true;
			this.emit("connected");
		});
		this._stream.on("data", data =>
		{
			JSON.parse(data).forEach(event =>
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
							this._resources[`${resource.type}/${resource.id}`]._alive = false;
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

	/**
	 * @template {keyof EventCallback} T
	 * @param {T} eventName The event name
	 * @param {EventCallback[T]} listener The listener
	 */
	on(eventName, listener)
	{return (super.on(eventName, listener))}

	/**
	 * @template {keyof EventCallback} T
	 * @param {T} eventName The event name
	 * @param {EventCallback[T]} listener The listener
	 */
	once(eventName, listener)
	{return (super.once(eventName, listener))}

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
		let refreshToken;

		if (new Date(this._remoteAccess.expires_at).getTime() > Date.now())
			return;
		refreshToken = await this._connector.getRefreshToken(this._remoteAccess);
		this._remoteAccess = {...this._remoteAccess, ...refreshToken};
		this.emit("refresh_token", refreshToken);
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
		this._streamEnabled = false
		this._stream?.close?.();
		this._connected = false;
		this._consumeEvents = true;
		this.emit("disconnected");
	}

	async refreshResources()
	{
		let baseURL;
		let req, result;

		baseURL = this._baseURL;
		try
		{
			if (this._remoteAccess)
			{
				baseURL += "/route";
				await this.refreshToken();
			}
			req = this.request(`https://${baseURL}/clip/v2/resource`);
			req.setHeader("Accept", "application/json");
			req.setHeader("hue-application-key", this._appKey);
			if (this._remoteAccess)
				req.setHeader("Authorization", `Bearer ${this._remoteAccess.access_token}`);
			else
				req.setStrictSSL(false);
			result = await req.execute();
			if (result.statusCode != 200)
				throw new Error(result.statusMessage);
			this.addResources(result.data);
			for (const id in this._resources)
				if (!result.data.data.find(resource => `${resource.type}/${resource.id}` == this._resources[id]._id))
					this._resources[id]._alive = false;
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

	addResources(resources)
	{
		let types = {};
		let devices, groups, scenes, smartScenes, services;

		types.devices = ["device"];
		types.groups = ["zone", "room", "bridge_home"];
		types.scenes = ["scene"];
		types.smartScenes = ["smart_scene"];

		devices = resources.data.filter(device => types.devices.includes(device.type.toLowerCase()));
		groups = resources.data.filter(group => types.groups.includes(group.type.toLowerCase()));
		scenes = resources.data.filter(device => types.scenes.includes(device.type.toLowerCase()));
		smartScenes = resources.data.filter(device => types.smartScenes.includes(device.type.toLowerCase()));
		services = resources.data.filter(service => !Object.values(types).flat().includes(service.type.toLowerCase()));
		devices?.forEach?.(resource => this.setResource(resource, services));
		groups?.forEach?.(resource => this.setResource(resource, services));
		scenes?.forEach?.(resource => this.setResource(resource, services));
		smartScenes?.forEach?.(resource => this.setResource(resource, services));
		services?.forEach?.(resource => this.setResource(resource, services));
	}

	deleteResources()
	{
		for (const id in this._resources)
		{
			if (!this._resources[id]._alive)
			{
				this._resources[id]._delete();
				delete this._resources[id];
			}
		}
	}

	setResource(data, list)
	{
		let resource;
		let service;
		let group;
		let mappingServices = (data, index) =>
		{
			let service;
			let uid = `${data.rtype}/${data.rid}`;

			index = list.findIndex(data => `${data.type}/${data.id}` == uid);
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
					default:
						service = new Service(this); break;
				}
				this._resources[uid] = service;
			}
			else
				service = this._resources[uid];
			if (data.type)
			{
				service._setData(data);
				if (!service._init)
					service._add();
			}
			return (service);
		}

		switch (data.type)
		{
			case Resource.Type.DEVICE:
			{
				data.services = data.services?.map(mappingServices);
				if (this._resources[`device/${data.id}`])
					resource = this._resources[`device/${data.id}`];
				else if (service = data.services.find(service => service instanceof BridgeService))
				{
					resource = this;
					this._addService(service);
				}
				else if (service = data.services.find(service => service instanceof LightService))
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
				else if (service = data.services.find(service => service instanceof MotionService))
				{
					if (!(resource = this.getMotionSensor(data.id)))
						resource = new MotionSensor(this);
				}
				else if (service = data.services.find(service => service instanceof ButtonService))
				{
					if (!(resource = this.getSwitch(data.id)))
						resource = new Switch(this);
				}
				else
					resource = new Device(this);
				resource._setData(data);
				if (!resource._init)
					resource._add();
				if (!(resource instanceof Bridge))
					this._resources[resource._id] ??= resource;
				break;
			}
			case Resource.Type.ZONE:
			case Resource.Type.ROOM:
			case Resource.Type.BRIDGE_HOME:
			{
				data.services = data.services?.map?.(mappingServices);
				data.children = data.children?.map?.(mappingServices);
				if (this.getGroup(data.id))
					resource = this.getGroup(data.id);
				else if (data.type == Resource.Type.ROOM)
					resource = new Room(this);
				else if (data.type == Resource.Type.ZONE)
					resource = new Zone(this);
				else if (data.type == Resource.Type.BRIDGE_HOME)
					resource = this._bridgeHome ??= new BridgeHome(this);
				else
					resource = new Group(this);
				resource._setData(data);
				if (!resource._init)
					resource._add();
				this._resources[resource._id] ??= resource;
				break;
			}
			case Resource.Type.SCENE:
			{
				group = this.getGroup(data.group.rid);
				if (!(resource = this.getScene(data.id)))
					resource = new Scene(this);
				resource._setData(data);
				resource._setGroup(group);
				group._addScene(resource);
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
				resource._setGroup(group);
				group._addScene(resource);
				if (!resource._init)
					resource._add();
				this._resources[resource._id] ??= resource;
				break;
			}
			default:
			{
				resource = new Resource(this, data);
				this._resources[resource._id] ??= resource;
				break;
			}
		}
	}

	/**
	 *
	 * @returns {Bridge.State[keyof Bridge.State]} The state of bridge connection
	 */
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
	getBridgeID()
	{return (this._bridgeData.getID())}

	/**
	 * Gets the list of light
	 *
	 * @returns {Light[]} The list of Light
	 */
	getLights()
	{return (Object.values(this._resources).filter(resource => resource instanceof Light))}

	/**
	 * Gets light from ID
	 *
	 * @param {string} id The ID
	 * @returns {Light} The list of Light
	 */
	getLight(id)
	{return (this._resources[`device/${id}`])}

	/**
	 * Gets the list of motion sensor
	 *
	 * @returns {MotionSensor[]} The list of MotionSensor
	 */
	getMotionSensors()
	{return (Object.values(this._resources).filter(resource => resource instanceof MotionSensor))}

	/**
	 * Gets motion sensor from ID
	 *
	 * @param {string} id The ID
	 * @returns {MotionSensor} The list of MotionSensor
	 */
	getMotionSensor(id)
	{return (this._resources[`device/${id}`])}

	/**
	 * Gets the list of switch
	 *
	 * @returns {Switch[]} The list of Switch
	 */
	getSwitches()
	{return (Object.values(this._resources).filter(resource => resource instanceof Switch))}

	/**
	 * Gets switch from ID
	 *
	 * @param {string} id The ID
	 * @returns {Switch} The Switch
	 */
	getSwitch(id)
	{return (this._resources[`device/${id}`])}

	/**
	 * Gets the list of group
	 *
	 * @returns {Group[]} The list of Group
	 */
	getGroups()
	{return (Object.values(this._resources).filter(resource => resource instanceof Group))}

	/**
	 * Gets group from ID
	 *
	 * @param {string} id The ID
	 * @returns {Group} The Group if exists, otherwise undefined
	 */
	getGroup(id)
	{return (this._resources[`room/${id}`] ?? this._resources[`zone/${id}`])}

	 /**
	 * Gets the list of scene
	 *
	 * @returns {(Scene|SmartScene)[]} The list of Group
	 */
	getScenes()
	{return (Object.values(this._resources).filter(resource => resource instanceof Scene || resource instanceof SmartScene))}

	/**
	 * Gets scene from ID
	 *
	 * @param {string} id The ID
	 * @returns {Scene|SmartScene} The Group
	 */
	getScene(id)
	{return (this._resources[`scene/${id}`])}

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
