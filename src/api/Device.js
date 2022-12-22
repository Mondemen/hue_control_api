import Resource from "./Resource.js";

/**
 * @typedef {import('./group/Room.js').default} Room
 * @typedef {import('./Resource.js').EventCallback} EventCallbackInherit
 */

/**
 * @callback NameEvent
 * @param {string} name - Name of device
 * @callback ArchetypeEvent
 * @param {string} archetype - Archetype of device
 *
 * @typedef EventCallbackTypes
 * @type {Object}
 * @property {NameEvent} name
 * @property {ArchetypeEvent} archetype
 * @typedef {EventCallbackInherit & EventCallbackTypes} EventCallback
 */

export default class Device extends Resource
{
	/**
	 * @type {Device}
	 * @private
	 */
	_services = {};
	/**
	 * @type {Room}
	 * @private
	 */
	_room;

	constructor(bridge, data)
	{
		super(bridge, data);
	}

	_setData(data)
	{
		super._setData(data);
		if (data?.metadata?.name != undefined && this._data.name != data?.metadata?.name)
			this.emit("name", this._data.name = data?.metadata?.name);
		if (data?.metadata?.archetype != undefined && this._data.archetype != data?.metadata?.archetype)
			this.emit("archetype", this._data.archetype = data?.metadata?.archetype);
		data?.services?.forEach(service =>
		{
			if (!(service instanceof Resource))
				service = this._bridge?._resources?.[`${service.type ?? service.rtype}/${service.id ?? service.rid}`];
			if (service instanceof Resource)
				this._addService(service);
		});
	}

	_addService(service)
	{
		service.setOwner(this);
		this._services[service._id] = service;
	}

	_add()
	{
		super._add();
		this._bridge?.emit("add_device", this);
		this._room?.emit("add_device", this);
	}

	_delete()
	{
		super._delete();
		this._bridge?.emit("delete_device", this);
		this._room?.emit("delete_device", this);
		this._room?._deleteDevice(this);
	}

	/**
	 * Set room of this device
	 *
	 * @param {Room} room - The room
	 * @private
	 */
	_setRoom(room)
	{this._room = room}

	/**
	 * Remove room of this device
	 *
	 * @private
	 */
	_deleteRoom()
	{this._room = undefined}

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
	 * Get room of this device
	 *
	 * @returns {Room}
	 */
	getRoom()
	{return (this._room)}
}
