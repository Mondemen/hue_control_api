import Resource from "./Resource.js";

export default class Device extends Resource
{
	_services = {};

	constructor(bridge, data)
	{
		super(bridge, data);
	}

	_setData(data, update = false)
	{
		super._setData(data, update);
		this._data.name = data?.metadata?.name ?? this._data.name;
		this._data.archetype = data?.metadata?.archetype ?? this._data.archetype;
		data?.services?.forEach(service =>
		{
			if (!(service instanceof Resource))
				service = this._bridge?._resources?.all?.[`${service.type ?? service.rtype}/${service.id ?? service.rid}`];
			if (service instanceof Resource)
				this._addService(service);
		});
	}

	_addService(service)
	{
		service.setOwner(this);
		this._services[service._id] = service;
	}

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
}
