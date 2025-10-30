import Bridge from "./Bridge";
import Room from "./group/Room";
import Resource, {EventCallbacks as EventCallbacksParent} from "./Resource";

export interface EventCallbacks extends EventCallbacksParent
{
	name: (name: string) => void,
	archetype: (archetype: string) => void
}

export default class Device extends Resource
{
	private _services: Record<string, Device> = {};
	_room?: Room;

	constructor(bridge?: Bridge, data?: any)
	{
		super(bridge, data);
	}

	_setData(data: any)
	{
		super._setData(data);
		if (data?.metadata?.name !== undefined && this._data.name !== data?.metadata?.name)
			this.emit("name", this._data.name = data?.metadata?.name);
		if (data?.metadata?.archetype !== undefined && this._data.archetype !== data?.metadata?.archetype)
			this.emit("archetype", this._data.archetype = data?.metadata?.archetype);
		data?.services?.forEach(service =>
		{
			if (!(service instanceof Resource))
				service = this._bridge?._resources?.[`${service.type ?? service.rtype}/${service.id ?? service.rid}`];
			if (service instanceof Resource)
				this._addService(service);
		});
	}

	protected _addService(service)
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
	 */
	setRoom(room: Room)
	{this._room = room}

	/**
	 * Remove room of this device
	 */
	protected deleteRoom()
	{this._room = undefined}

	emit<T extends keyof EventCallbacks>(eventName: T, ...args: Parameters<EventCallbacks[T]>) {return (super.emit<any>(eventName, ...args))}
	on<T extends keyof EventCallbacks>(eventName: T, listener: EventCallbacks[T]) {return (super.on<any>(eventName, listener))}
	once<T extends keyof EventCallbacks>(eventName: T, listener: EventCallbacks[T]) {return (super.once<any>(eventName, listener))}
	removeAllListeners<T extends keyof EventCallbacks>(eventName: T) {return (super.removeAllListeners<any>(eventName))}

	/**
	 * Gets the name
	 *
	 * @returns {string} The name
	 */
	getName(): string
	{return (this._data.name)}

	/**
	 * Gets the arche type
	 *
	 * @returns {string} The arche type
	 */
	getArchetype(): string
	{return (this._data.archetype)}

	/**
	 * Get room of this device
	 */
	getRoom()
	{return (this._room)}
}
