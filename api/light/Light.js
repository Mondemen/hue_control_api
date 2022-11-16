import Device from "../Device.js";
import ConnectivityService from "../service/ConnectivityService.js";
import LightService from "../service/LightService.js";

/**
 * @typedef {import('../service/Service.js').default} Service
 * @typedef {import('../group/Room.js').default} Room
 * @typedef {import('../group/Zone.js').default} Zone
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
	 * @type {Object.<string,Zone>}
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
	 * Gets the name
	 *
	 * @returns {string} The name
	 */
	getName()
	{return (this._data.name)}

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

	getZones()
	{return (this._zone)}

	getZone(id)
	{return (this._zone[id])}

	/**
	 * Gets the current connectivity status
	 *
	 * @returns {Light.Status[keyof typeof Light.Status]} The status
	 */
	getStatus()
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
