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
 * @typedef {import('../Resource.js').EventCallback} EventCallbackInherit
 */

/**
 * @callback NameEvent
 * @param {string} name - Name of device
 *
 * @callback ArchetypeEvent
 * @param {string} archetype - Archetype of device
 *
 * @callback AddDeviceEvent
 * @param {Device} device - Added device
 *
 * @callback DeleteDeviceEvent
 * @param {Device} device - Deleted device
 *
 * @callback LightNameEvent
 * @param {Light} light - Updated light
 * @param {string} name - Name of device
 *
 * @callback LightArchetypeEvent
 * @param {Light} light - Updated light
 * @param {string} archetype - Archetype of device
 *
 * @callback LightEventStart
 * @param {Light} light - Updated light
 *
 * @callback LightEventEnd
 * @param {Light} light - Updated light
 *
 * @callback LightStateEvent
 * @param {Light} light - Updated light
 * @param {LightService.State[keyof typeof LightService.State]} state - The state of light
 *
 * @callback LightBrightnessEvent
 * @param {Bulb} light - Updated light
 * @param {number} brighness - The brightness of light
 *
 * @callback LightColorTemperatureEvent
 * @param {WhiteAmbianceBulb} light - Updated light
 * @param {Mired} mirek - The color temperature of light
 *
 * @callback LightColorTemperatureMiredEvent
 * @param {WhiteAmbianceBulb} light - Updated light
 * @param {number} mirek - The color temperature of light in mired format
 *
 * @callback LightColorEvent
 * @param {ColorBulb|WhiteAndColorBulb} light - Updated light
 * @param {Color} color - The color of light
 *
 * @callback LightColorXYEvent
 * @param {ColorBulb|WhiteAndColorBulb} light - Updated light
 * @param {XYValue} color - The color of light in XY format
 *
 * @callback LightEffectEvent
 * @param {Bulb} light - Updated light
 * @param {LightService.Effect[keyof typeof LightService.Effect]} effect - The effect of light
 *
 * @callback LightDynamicSpeedEvent
 * @param {Bulb} light - Updated light
 * @param {number} speed - The speed of dynamic scene, between 0 and 100
 *
 * @callback LightDynamicStatusEvent
 * @param {Bulb} light - Updated light
 * @param {LightService.DynamicStatus[keyof typeof LightService.DynamicStatus]} status - The dynamic scene status
 *
 * @callback LightModeEvent
 * @param {Light} light - Updated light
 * @param {LightService.Mode[keyof typeof LightService.Mode]} mode - The mode of light
 *
 * @callback LightRawModeEvent
 * @param {Light} light - Updated light
 * @param {string} mode - The raw mode of light
 *
 * @callback LightGradientColorEvent
 * @param {ColorBulb|WhiteAndColorBulb} light - Updated light
 * @param {number} i - Index position of color in array
 * @param {Color} color - The color
 *
 * @callback LightGradientColorXYEvent
 * @param {ColorBulb|WhiteAndColorBulb} light - Updated light
 * @param {number} i - Index position of color in array
 * @param {XYValue} color - The color in XY format
 *
 * @callback LightPowerupPresetEvent
 * @param {Light} light - Updated light
 * @param {Powerup.Preset[keyof typeof Powerup.Preset]} preset - The preset
 *
 * @callback LightPowerupConfiguredEvent
 * @param {Light} light - Updated light
 * @param {boolean} configured - Is powerup is configured
 *
 * @callback LightPowerupStateModeEvent
 * @param {Light} light - Updated light
 * @param {Powerup.StateMode[keyof typeof Powerup.StateMode]} mode - The state mode
 *
 * @callback LightPowerupStateEvent
 * @param {Light} light - Updated light
 * @param {Powerup.State[keyof typeof Powerup.State]} state - The state
 *
 * @callback LightPowerupDimmingModeEvent
 * @param {Light} light - Updated light
 * @param {Powerup.DimmingMode[keyof typeof Powerup.DimmingMode]} mode - The dimming mode
 *
 * @callback LightPowerupBrightnessEvent
 * @param {Light} light - Updated light
 * @param {number} brightness - The brightness
 *
 * @callback LightPowerupColorModeEvent
 * @param {Light} light - Updated light
 * @param {Powerup.ColorMode[keyof typeof Powerup.ColorMode]} mode - The color mode
 *
 * @callback LightPowerupColorEvent
 * @param {Light} light - Updated light
 * @param {Color} color - The color
 *
 * @callback LightPowerupColorTemperatureEvent
 * @param {Light} light - Updated light
 * @param {Mired} mired - The color temperature
 *
 * @typedef EventCallbackTypes
 * @type {Object}
 * @property {NameEvent} name
 * @property {ArchetypeEvent} archetype
 * @property {AddDeviceEvent} add_device
 * @property {DeleteDeviceEvent} delete_device
 * @property {LightNameEvent} light_name
 * @property {LightArchetypeEvent} light_archetype
 * @property {LightEventStart} light_event_start
 * @property {LightEventEnd} light_event_end
 * @property {LightStateEvent} light_state
 * @property {LightBrightnessEvent} light_brightness
 * @property {LightColorTemperatureEvent} light_color_temperature
 * @property {LightColorTemperatureMiredEvent} light_color_temperature_mired
 * @property {LightColorEvent} light_color
 * @property {LightColorXYEvent} light_color_xy
 * @property {LightEffectEvent} light_effect
 * @property {LightDynamicSpeedEvent} light_dynamic_speed
 * @property {LightDynamicStatusEvent} light_dynamic_status
 * @property {LightModeEvent} light_mode
 * @property {LightRawModeEvent} light_raw_mode
 * @property {LightGradientColorEvent} light_gradient_color
 * @property {LightGradientColorXYEvent} light_gradient_color_xy
 * @property {LightPowerupPresetEvent} light_powerup_preset
 * @property {LightPowerupConfiguredEvent} light_powerup_configured
 * @property {LightPowerupStateModeEvent} light_powerup_state_mode
 * @property {LightPowerupStateEvent} light_powerup_state
 * @property {LightPowerupDimmingModeEvent} light_powerup_dimming_mode
 * @property {LightPowerupBrightnessEvent} light_powerup_drightness
 * @property {LightPowerupColorModeEvent} light_powerup_color_mode
 * @property {LightPowerupColorEvent} light_powerup_color
 * @property {LightPowerupColorTemperatureEvent} light_powerup_color_temperature
 * @typedef {EventCallbackInherit & EventCallbackTypes} EventCallback
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

	/**
	 * @param {*} data
	 * @protected
	 */
	_setData(data)
	{
		super._setData(data);
		if (this._data.name != data?.metadata?.name)
			this.emit("name", this._data.name = data?.metadata?.name);
		if (this._data.archetype != data?.metadata?.archetype)
			this.emit("archetype", this._data.archetype = data?.metadata?.archetype);
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

	/**
	 * @returns {Object}
	 * @protected
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
	 * @param {GroupLightService} service The service
	 * @protected
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
	 * @protected
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
	 * @protected
	 */
	_deleteScene(scene)
	{delete this._scenes[scene?.getID?.() ?? scene]}

	/**
	 * Add Device
	 *
	 * @param {Device} device The device
	 * @protected
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
	 * @protected
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
