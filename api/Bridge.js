import MotionSensor from "./accessory/MotionSensor.js";
import Switch from "./accessory/Switch.js";
import Device from "./Device.js";
import ColorBulb from "./light/ColorBulb.js";
import Light from "./light/Light.js";
import Plug from "./light/Plug.js";
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
import Group from "./group/Group.js";
import BridgeHome from "./group/BridgeHome.js";
import Room from "./group/Room.js";
import Zone from "./group/Zone.js";

// import util from "util";
// import {createRequire} from 'module';
// const require = createRequire(import.meta.url);

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

	_baseURL;
	_appKey;
	_remoteAccess;
	_connected = false;
	_stream;
	_streamEnabled = false;
	_bridgeHome;
	_bridgeData;
	_connectivity;
	_entertainment;
	_service = {};
	_request;
	_resources =
	{
		light: {},
		motion: {},
		switch: {},
		button: {},
		device: {},
		group: {},
		service: {},
		resource: {},
		all: {}
	}

	constructor(baseURL, appKey, remoteAccess, request)
	{
		super();
		if (!baseURL)
			throw new Error("No base URL defined");
		if (!appKey)
			throw new Error("No application key defined");
		if (!request)
			throw new Error("No request client has been defined");
		this._baseURL = baseURL;
		this._appKey = appKey;
		this._remoteAccess = remoteAccess;
		this._request = request;
	}

	_addService(service)
	{
		super._addService(service);
		if (service instanceof BridgeService)
			this._bridgeData = service;
	}

	isConnected()
	{return (this._connected)}

	async connect()
	{
		let result, resources;
		let devices, groups, services;
		let streamConnect = async () =>
		{
			let resourceObj;

			this._stream = new this._request(`https://${this._baseURL}/eventstream/clip/v2`)
			.setStrictSSL(false)
			.setHeader("Accept", "application/json")
			.setHeader("hue-application-key", this._appKey)
			.connect()

			this._stream.on("open", () =>
			{
				this._connected = true;
				this.emit("connected");
			});
			this._stream.on("data", data =>
			{
				let updatedResource = {};

				// console.time("EVENT");
				JSON.parse(data).forEach(event =>
				{
					// console.log("EVENT ORIGIN", event.type, util.inspect(event.data, false, null, true));
					event.data.forEach(async resource =>
					{
						if (!this._resources.all[`${resource.type}/${resource.id}`])
							return;
						resourceObj = this._resources.all[`${resource.type}/${resource.id}`]
						if (!updatedResource[`${resource.type}/${resource.id}`])
						{
							resourceObj.emit("event_start");
							updatedResource[`${resource.type}/${resource.id}`] = resourceObj;
						}
						if (event.type.toLowerCase() == "update")
						{
							// if (resource.type == "light")
								// console.log("EVENT", resource, event.type);
							// console.time(`${resource.id} -- ${resource.type}`);
							resourceObj._setData(resource, true);
							// if (resourceObj instanceof Group || resourceObj instanceof GroupedLightService)
								// await oldStreamConnect(true);
							resourceObj.emit("change");
							// console.timeEnd(`${resource.id} -- ${resource.type}`);
						}
					})
				})
				Object.values(this._resources.all).forEach(resource =>
				{
					if (resource._called)
					{
						resource._called = false;
						resource.emit("event_end");
					}
				});
				// console.timeEnd("EVENT");
			});
			this._stream.on("error", error =>
			{
				this.emit("connection_error", error);
				if (this._connected)
					this.emit("disconnected");
				this._connected = false;
				this._stream?.close?.();
				streamConnect();
			});
		}
		let oldStreamConnect = async (once = false) =>
		{
			let url = `https://${this._baseURL}/api/${this._appKey}${this.getOldID()}`;
			let groups = {}, groupedLightServices = {}, lightServices = {};
			
			if (!this._streamEnabled)
				return;
			try
			{
				resources = (await new this._request(`${url}`).get().setStrictSSL(false).setHeader("Accept", "application/json").execute()).data;
				this._connected = true;
				Object.values(this._resources.service).forEach(service =>
				{
					if (service instanceof GroupedLightService)
						groupedLightServices[service.getOldID()] = service;
					else if (service instanceof LightService)
						lightServices[service.getOldID()] = service;
				})
				groups = Object.values(this._resources.group).reduce((result, group) => {result[group.getOldID()] = group; return (result)}, {});
				Object.entries(resources.groups).forEach(([id, group]) =>
				{
					id = `/groups/${id}`;
					if (groups[id])
						groups[id]._setData(groups[id].convertOldData(id, group, {groupedLightServices, lightServices}), true);
					if (groupedLightServices[id])
						groupedLightServices[id]._setData(groupedLightServices[id].convertOldData(id, group, {groupedLightServices, lightServices}), true);
				})
			}
			catch (error)
			{
				this.emit("connection_error", error);
				if (this._connected)
					this.emit("disconnected");
				this._connected = false;
			}
			finally
			{
				if (this._streamEnabled && !once)
					setTimeout(oldStreamConnect, 1000);
			}
		};

		if (this._connected)
			return;
		try
		{
			result = (await new this._request(`https://${this._baseURL}/clip/v2/resource`)
			.setStrictSSL(false)
			.setHeader("Accept", "application/json")
			.setHeader("hue-application-key", this._appKey)
			.execute());
			resources = result.data;

			// console.log();
			// console.log(result.headers);
			// resources = JSON.parse(resources.data);
			devices = resources.data.filter(device => device.type.toLowerCase() == "device");
			groups = resources.data.filter(group => ["zone", "room", "bridge_home"].includes(group.type.toLowerCase()));
			services = resources.data.filter(service => !["device", "zone", "room", "bridge_home"].includes(service.type.toLowerCase()));
			devices?.forEach?.(resource => this.addResource(resource, services));
			groups?.forEach?.(resource => this.addResource(resource, services));
			services?.forEach?.(resource => this.addResource(resource, services));
			this._streamEnabled = true;
			
			streamConnect();
			// await Promise.all([streamConnect(), oldStreamConnect()]);
			// this._connected = true;
			// this.emit("connected");
		}
		catch (error)
		{this.emit("connection_error", error)}
	}

	close()
	{
		if (!this._connected)
			return;
		this._streamEnabled = false
		this._stream?.close?.();
		this._connected = false;
		this.emit("disconnected");
	}

	addResource(data, list)
	{
		let index;
		let resource;
		let service;
		let uid;
		let mappingServices = (data, index) =>
		{
			let service;
			let uid = `${data.rtype}/${data.rid}`;

			index = list.findIndex(data => `${data.type}/${data.id}` == uid);
			data = (index >= 0) ? list.splice(index, 1)[0] : data;
			if (!this._resources.all[uid])
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
				service._setData(data);
				this._resources.all[service._id] = this._resources.service[service._id] = service;	
			}
			else
				service = this._resources.all[uid];
			return (service);
		}

		switch (data.type)
		{
			case Resource.Type.DEVICE:
			{
				data.services = data.services?.map?.(mappingServices);
				if (service = data.services.find(service => service instanceof BridgeService))
					resource = this._resources.resource[data.id] = this;
				else if (service = data.services.find(service => service instanceof LightService))
				{
					if (service.getCapabilities().every(capability => ["state"].includes(capability)))
						resource = this._resources.light[data.id] = new Plug(this);
					else if (service.getCapabilities().every(capability => ["state", "dimming"].includes(capability)))
						resource = this._resources.light[data.id] = new WhiteBulb(this);
					else if (service.getCapabilities().every(capability => ["state", "dimming", "color_temperature"].includes(capability)))
						resource = this._resources.light[data.id] = new WhiteAmbianceBulb(this);
					else if (service.getCapabilities().every(capability => ["state", "dimming", "color_temperature", "color"].includes(capability)))
						resource = this._resources.light[data.id] = new WhiteAndColorBulb(this);
					else if (service.getCapabilities().every(capability => ["state", "dimming", "color"].includes(capability)))
						resource = this._resources.light[data.id] = new ColorBulb(this);
					else
						resource = this._resources.light[data.id] = new Light(this);
				}
				else if (service = data.services.find(service => service instanceof MotionService))
					resource = this._resources.motion[data.id] = new MotionSensor(this);
				else if (service = data.services.find(service => service instanceof ButtonService))
				{
					resource = this._resources.switch[data.id] = new Switch(this);
				}
				else
					resource = this._resources.device[data.id] = new Device(this);
				resource._setData(data);				
				this._resources.all[resource._id] = resource;
				break;
			}
			case Resource.Type.ZONE:
			case Resource.Type.ROOM:
			case Resource.Type.BRIDGE_HOME:
			{
				data.services = data.services?.map?.(mappingServices);
				data.children = data.children?.map?.(mappingServices);
				if (data.type == Resource.Type.ROOM)
					resource = this._resources.group[data.id] = new Room(this);
				else if (data.type == Resource.Type.ZONE)
					resource = this._resources.group[data.id] = new Zone(this);
				else if (data.type == Resource.Type.BRIDGE_HOME)
					resource = this._bridgeHome = new BridgeHome(this);
				resource._setData(data);
				this._resources.all[resource._id] = resource;
				break;
			}
			default:
			{
				resource = new Resource(this, data);
				this._resources.all[resource._id] ??= this._resources.resource[resource._id] ??= resource;
				break;
			}
		}
	}

	/**
	 * 
	 * @returns {Bridge.State} The state of bridge connection
	 */
	getState()
	{return (this._request.getState())}

	getBridgeID()
	{return (this._bridgeData.getID())}

	/**
	 * Gets the list of light
	 * 
	 * @returns {Light[]} The list of Light
	 */
	getLights()
	{return (Object.values(this._resources.light))}

	/**
	 * Gets the list of motion sensor
	 * 
	 * @returns {MotionSensor[]} The list of MotionSensor
	 */
	getMotions()
	{return (Object.values(this._resources.motion))}

	/**
	 * Gets the list of switch
	 * 
	 * @returns {Switch[]} The list of Switch
	 */
	getSwitches()
	{return (Object.values(this._resources.switch))}

	/**
	 * Gets the list of group
	 * 
	 * @returns {Group[]} The list of Group
	 */
	getGroups()
	{return (Object.values(this._resources.group))}

	/**
	 * Gets group from ID
	 * 
	 * @param {string} id The ID
	 * @returns {Group} The Group if exists, otherwise undefined
	 */
	getGroup(id)
	{return (this._resources.group[id])}

	describe()
	{
		this.getGroups().forEach(group =>
		{
			console.log(`${group.getName()} (${group.getObjectType()}) :`);
			group.getLights().forEach(light =>
			{
				console.log(`    - ${light.getName()} (${light.getObjectType()})`);
			})
			console.log();
		})
	}
}
