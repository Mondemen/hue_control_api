import Device from "../Device.js";
import ConnectivityService from "../service/ConnectivityService.js";
import LightService from "../service/LightService.js";

/**
 * @typedef {import('../service/Service.js').default} Service
 * @typedef {import('../group/Room.js').default} Room
 * @typedef {import('../group/Zone.js').default} Zone
 * @typedef {import('../Resource.js').EventCallback} EventCallbackInherit
 */
/**
 * @typedef EventCallbackTypes
 * @type {Object}
 * @property {import("../service/LightService.js").StateEvent} state
 * @property {import("../service/LightService.js").ModeEvent} mode
 * @property {import("../service/LightService.js").RawModeEvent} raw_mode
 * @property {import("../../lib/Powerup.js").PowerupPresetEvent} powerup_preset
 * @property {import("../../lib/Powerup.js").PowerupConfiguredEvent} powerup_configured
 * @property {import("../../lib/Powerup.js").PowerupStateModeEvent} powerup_state_mode
 * @property {import("../../lib/Powerup.js").PowerupStateEvent} powerup_state
 * @property {import("../../lib/Powerup.js").PowerupDimmingModeEvent} powerup_dimming_mode
 * @property {import("../../lib/Powerup.js").PowerupBrightnessEvent} powerup_brightness
 * @property {import("../../lib/Powerup.js").PowerupColorModeEvent} powerup_color_mode
 * @property {import("../../lib/Powerup.js").PowerupColorEvent} powerup_color
 * @property {import("../../lib/Powerup.js").PowerupColorTemperatureEvent} powerup_color_temperature
 * @typedef {EventCallbackInherit & EventCallbackTypes} EventCallback
 */

export default class Light extends Device
{
	static Status = ConnectivityService.Status;
	static Capabilities = LightService.Capabilities;
	static State = LightService.State;
	static Mode = LightService.Mode;

	/**
	 * @type {LightService}
	 * @private
	 */
	_light;
	/**
	 * @type {ConnectivityService}
	 * @private
	 */
	_connectivity;
	/**
	 * @type {Object<string,Zone>}
	 * @private
	 */
	_zone = {};

	constructor(bridge, data)
	{
		super(bridge, data);
	}

	/**
	 * @param {Service} service
	 * @private
	 */
	_addService(service)
	{
		super._addService(service);
		if (service instanceof LightService)
			this._light = service;
		if (service instanceof ConnectivityService)
			this._connectivity = service;
	}

	_add()
	{
		super._add();
		this._bridge?.emit("add_light", this);
		for (const id in this._zone)
			this._zone[id].emit("add_light", this);
	}

	_delete()
	{
		super._delete();
		this._bridge?.emit("delete_light", this);
		for (const id in this._zone)
		{
			this._zone[id].emit("delete_light", this);
			this._zone[id]._deleteDevice(this);
		}
	}

	/**
	 * Add zone to this light
	 *
	 * @param {Zone} zone - The zone
	 * @private
	 */
	_addZone(zone)
	{this._zone[zone.getID()] = zone}

	/**
	 * Delete zone to this light
	 *
	 * @param {Zone|string} zone - The zone or his ID
	 * @private
	 */
	_deleteZone(zone)
	{delete this._zone[zone?.getID?.() ?? zone]}

	emit(eventName, ...args)
	{
		if (eventName.includes("event_start"))
		{
			for (const id in this._zone)
				this._zone[id]._eventStart();
			this._room?._eventStart();
		}
		for (const id in this._zone)
			this._zone[id].emit(`light_${eventName}`, this, ...args);
		this._room?.emit?.(`light_${eventName}`, this, ...args);
		super.emit(eventName, ...args);
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
	 * Gets the list of capabilities
	 *
	 * @returns {Set<Light.Capabilities[keyof typeof Light.Capabilities]>} The list of capabilities
	 */
	getCapabilities()
	{return (this._light.getCapabilities())}

	/**
	 * Gets the current mode of the light
	 *
	 * @returns {Light.Mode[keyof typeof Light.Mode]} The mode
	 */
	getMode()
	{return (this._light.getMode())}

	/**
	 * Gets the current raw mode of light (normal or streaming)
	 *
	 * @returns {string} The raw mode
	 */
	getRawMode()
	{return (this._light.getRawMode())}

	getZones()
	{return (this._zone)}

	getZone(id)
	{return (this._zone[id])}

	/**
	 * Gets the current connectivity status
	 *
	 * @returns {Light.Status[keyof typeof Light.Status]} The status
	 */
	getConnectivityStatus()
	{return (this._connectivity.getStatus())}

	/**
	 * Gets the state of light
	 *
	 * @returns {Light.State[keyof typeof Light.State]} The state of light
	 */
	getState()
	{return (this._light.getState())}

	/**
	 * Set state of light
	 *
	 * @param {Light.State[keyof typeof Light.State]} state The state
	 * @returns {Light|Promise} Return this object if prepareUpdate() was called, otherwise returns Promise
	 */
	setState(state)
	{return (this._light.setState(state, this))}

	/**
	 * Turn on the light
	 *
	 * @param {Light.State[keyof typeof Light.State]} state The state
	 * @returns {Light|Promise} Return this object if prepareUpdate() was called, otherwise returns Promise
	 */
	turnOn()
	{return (this._light.setState(Light.State.ON, this))}

	/**
	 * Turn off the light
	 *
	 * @param {Light.State[keyof typeof Light.State]} state The state
	 * @returns {Light|Promise} Return this object if prepareUpdate() was called, otherwise returns Promise
	 */
	turnOff()
	{return (this._light.setState(Light.State.OFF, this))}

	getPowerup()
	{return (this._light.getPowerup(this))}
}
