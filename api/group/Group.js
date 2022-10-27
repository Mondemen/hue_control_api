import MinimalLengthError from "../../lib/error/MinimalLengthError.js";
import Light from "../light/Light.js";
import Resource from "../Resource.js";
import Scene from "../Scene.js";
import GroupedLightService from "../service/GroupedLightService.js";

const numberAverage = numbers => numbers.reduce((p, c) => p + c, 0) / (numbers.length || 1);

/**
 * @typedef {import('../Device.js').default} Device
 * @typedef {import('../light/Light.js').default} Light
 * @typedef {import('../service/Service.js').default} Service
 */

export default class Group extends Resource
{
	static State = GroupedLightService.State;
	static ColorTemperatureUnit = GroupedLightService.ColorTemperatureUnit;
	static ColorUnit = GroupedLightService.ColorUnit;
	static AlertType = GroupedLightService.AlertType;

	/**
	 * @type {Object<string,Device>}
	 * @private
	 */
	_devices = {};
	/**
	 * @type {GroupedLightService}
	 * @private
	 */
	_groupedLight;
	/**
	 * @type {Object<string,Service>}
	 * @private
	 */
	 _services = {};
	/**
	 * @type {Object<string,Scene>}
	 * @private
	 */
	_scenes = {};

	constructor(bridge, data)
	{
		super(bridge, data);
	}

	[Symbol.for('nodejs.util.inspect.custom')]()
	{
		return (
		{
			...super[Symbol.for('nodejs.util.inspect.custom')](),
			lights: Object.values(this._devices),
		})
	}

	_setData(data, update = false)
	{
		super._setData(data, update);
		if (this._data.name != data?.metadata?.name)
		{
			this._data.name = data?.metadata?.name;
			this.emit("name", this._data.name);
		}
		if (this._data.archetype != data?.metadata?.archetype)
		{
			this._data.archetype = data?.metadata?.archetype;
			this.emit("archetype", this._data.archetype);
		}
		data?.services?.forEach(service =>
		{
			if (!(service instanceof Resource))
				service = this._bridge?._resources?.[`${service.type ?? service.rtype}/${service.id ?? service.rid}`];
			if (service instanceof Resource)
				this._addService(service);
		});
		this._data.minBrightness = +Object.values(this._devices).filter(device => device instanceof this.getBridge().Object.Light).reduce((result, light) =>
		{
			if (light.getCapabilities().has("dimming"))
				result = Math.min(result, light.getMinBrightness());
			return (result);
		}, (Object.keys(this._devices).length) ? Infinity : 0).toFixed(2);
	}

	/**
	 * @returns {Object}
	 * @private
	 */
	_getFullData()
	{
		return (
		{
			...super._getFullData(),
			name: this._data.name,
			archetype: this._data.archetype,
			...this._groupedLight?._getFullData(),
			lights: Object.keys(this._devices)
		})
	}

	/**
	 * Add GroupLightService
	 * 
	 * @private
	 * @param {GroupLightService} service The service
	 */
	_addService(service)
	{
		this._services[service._id] = service;
		if (service instanceof GroupedLightService)
		{
			service.setOwner(this);
			this._groupedLight = service;
		}
	}

	/**
	 * Add Scene
	 * 
	 * @param {Scene} scene The scene
	 * @private
	 */
	_addScene(scene)
	{
		if (scene instanceof Scene)
			this._scenes[scene.getID()] = scene;
	}

	/**
	 * Delete Scene
	 * 
	 * @param {Scene|string} scene The scene
	 * @private
	 */
	_deleteScene(scene)
	{delete this._scenes[scene?.getID?.() ?? scene]}

	/**
	 * Add Device
	 * 
	 * @param {Device} device The device
	 * @private
	 */
	_addDevice(device)
	{
		if (device instanceof this.getBridge().Object.Device)
			this._devices[device.getID()] = device;
	}

	/**
	 * Delete Device
	 * 
	 * @param {Device|string} device The device
	 * @private
	 */
	_deleteDevice(device)
	{delete this._devices[device?.getID?.() ?? device]}

	createScene()
	{
		let scene = new Scene(this._bridge);

		scene._exists = false;
		scene._setGroup(this);
		return (scene);
	}

	getScenes()
	{return (Object.values(this._scenes))}

	getScene(id)
	{return (this._scenes[id])}

	/**
	 * Gets the name
	 * 
	 * @returns {string} The name
	 */
	getName()
	{return (this._data.name)}

	/**
	 * Gets the arche type
	 * 
	 * @returns {string} The arche type
	 */
	getArchetype()
	{return (this._data.archetype)}

	/**
	 * Add device to group
	 * 
	 * @param {Device} device The device to adds to the group
	 * @returns {Group|Promise} Return this object if prepareUpdate() was called, otherwise returns Promise
	 */
	addDevice(device)
	{
		this._update ??= {};
		this._update.children ??= Object.values(this._devices).map(device => ({rtype: device.getType(), rid: device.getID()}));
		this._update.children.push({rtype: device.getType(), rid: device.getID()});
		if (this._prepareUpdate)
			return (this);
		return (this.update());
	}

	/**
	 * Remove device to group
	 * 
	 * @param {Device} device The device to remove from the group
	 * @returns {Group|Promise} Return this object if prepareUpdate() was called, otherwise returns Promise
	 */
	removeDevice(device)
	{
		let index;

		this._update ??= {};
		this._update.children ??= Object.values(this._devices).map(device => ({rtype: device.getType(), rid: device.getID()}));
		if (this._update[""].children.length <= 1)
			throw new MinimalLengthError(this, "removeDevice", this.getType(), "device", 1);
		if ((index = this._update[""].children.findIndex(child => child.rid == device.getID())) >= 0)
			this._update[""].children.splice(index, 1);
		if (this._prepareUpdate)
			return (this);
		return (this.update());
	}

	/**
	 * Gets device from this group
	 * 
	 * @param {string} id The device ID
	 * @returns {Device} The device
	 */
	getDevice(id)
	{return (this._devices[id])}

	/**
	 * Gets the list of device in this group
	 * 
	 * @returns {Device[]} The list of device
	 */
	getDevices()
	{return (Object.values(this._devices))}

	getState()
	{return (this._groupedLight?.getState?.() ?? Group.State.OFF)}

	setState(state)
	{return (this._groupedLight?.setState?.(state, this) ?? ((this._prepareUpdate) ? true : Promise.resolve()))}

	turnOn()
	{return (this.setState(Group.State.ON))}

	turnOff()
	{return (this.setState(Group.State.OFF))}

	getMinBrightness()
	{return (this._data.minBrightness)}

	getBrightness()
	{
		let brightness;

		if (this._groupedLight?.getBrightness?.() != undefined)
			return (Math.max(this._groupedLight.getBrightness(), this.getMinBrightness()))
		brightness = this.getDevices().filter(device => device instanceof this.getBridge().Object.Light).reduce((list, light) =>
		{
			if (light.getState?.() && light.getCapabilities?.().has("dimming"))
				list.push(light.getBrightness?.());
			return (list);
		}, []);
		if (brightness.length)
			return (brightness.reduce((sum, value) => sum + value, 0) / brightness.length);
		return (0);
	}

	setBrightness(brightness)
	{
		brightness = Math.max(brightness, this.getMinBrightness());
		return (this._groupedLight?.setBrightness?.(brightness, this) ?? ((this._prepareUpdate) ? true : Promise.resolve()));
	}

	setColor(color)
	{return (this._groupedLight.setColor(color, this))}

	setColorTemperature(mired)
	{return (this._groupedLight.setColorTemperature(mired, this))}
}
