import Device from "../Device.js";
import ConnectivityService from "../service/ConnectivityService.js";
import LightService from "../service/LightService.js";
import Room from "../group/Room.js";
import Zone from "../group/Zone.js";

export default class Light extends Device
{
	static Status = ConnectivityService.Status;
	static Capabilities = LightService.Capabilities;
	static State = LightService.State;

	/** @type {LightService} */
	_light;
	/** @type {ConnectivityService} */
	_connectivity;
	/** @type {Object.<string,Zone>} */
	_zone = {};
	/** @type {Room} */
	_room;

	constructor(bridge, data)
	{
		super(bridge, data);
	}

	_setData(data, update = false)
	{
		super._setData(data, update);
		this._data.name = data?.metadata?.name ?? this._data.name;
		this._data.archetype = data?.metadata?.archetype ?? this._data.archetype;
	}

	_addService(service)
	{
		super._addService(service);
		if (service instanceof LightService)
			this._light = service;
		if (service instanceof ConnectivityService)
			this._connectivity = service;
	}

	emit(eventName, ...args)
	{
		let propagate = this._propagate;

		super.emit(eventName, ...args);
		Object.values(this?._zone ?? {}).forEach(zone =>
		{
			if (zone)
			{
				zone.emit(`light_${eventName}`, this, ...args);
				if (!zone._called)
					zone.emit("event_start");
				zone._called = true;
			}
			// if (propagate)
			// {
			// 	if (eventName == "state")
			// 		zone?._updateFromChildren("brightness", this, true);
			// 	zone?._updateFromChildren(eventName, this, true);
			// }
		});
		if (this._room)
		{
			this._room.emit(`light_${eventName}`, this, ...args);
			if (!this._room._called)
				this._room.emit("event_start");
			this._room._called = true;
		}
		// if (propagate)
		// {
		// 	if (eventName == "state")
		// 		this?._room?._updateFromChildren("brightness", this, true);
		// 	this?._room?._updateFromChildren(eventName, this, true);
		// }
	}

	getName()
	{return (this._data.name)}

	getCapabilities()
	{return (this._light.getCapabilities())}

	addZone(zone)
	{this._zone[zone.getID()] = zone}

	removeZone(zone)
	{delete this._zone[zone.getID()]}

	getZones()
	{return (this._zone)}

	setRoom(room)
	{this._room = room}

	getRoom()
	{return (this._room)}

	/**
	 * Gets the current connectivity status
	 * 
	 * @returns {Light.Status} The status
	 */
	getStatus()
	{return (this._connectivity.getStatus())}

	getState()
	{return (this._light.getState())}

	setState(state)
	{return (this._light.setState(state, this))}

	turnOn()
	{return (this._light.setState(Light.State.ON, this))}

	turnOff()
	{return (this._light.setState(Light.State.OFF, this))}

	getMinBrightness()
	{return (this._light.getMinBrightness())}
	
	getBrightness()
	{return (this._light.getBrightness())}

	setState(state)
	{return (this._light.setState(state, this))}
}
