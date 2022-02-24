/**
 * @typedef {import('./Bridge.js').default} Bridge
 */

export default class Resource
{
	/**
	 * Type of resource
	 * 
	 * @enum {string}
	 * @readonly
	 */
	static Type =
	{
		AUTH_V1: "auth_v1",
		BEHAVIOR_INSTANCE: "behavior_instance",
		BEHAVIOR_SCRIPT: "behavior_script",
		BRIDGE_HOME: "bridge_home",
		BRIDGE: "bridge",
		BUTTON: "button",
		DEVICE_POWER: "device_power",
		DEVICE: "device",
		ENTERTAINMENT_CONFIGURATION: "entertainment_configuration",
		ENTERTAINMENT: "entertainment",
		GEOFENCE_CLIENT: "geofence_client",
		GEOFENCE: "geofence",
		GEOLOCATION: "geolocation",
		GROUPED_LIGHT: "grouped_light",
		HOMEKIT: "homekit",
		LIGHT_LEVEL: "light_level",
		LIGHT: "light",
		MOTION: "motion",
		PUBLIC_IMAGE: "public_image",
		ROOM: "room",
		SCENE: "scene",
		TEMPERATURE: "temperature",
		ZGP_CONNECTIVITY: "zgp_connectivity",
		ZIGBEE_BRIDGE_CONNECTIVITY: "zigbee_bridge_connectivity",
		ZIGBEE_CONNECTIVITY: "zigbee_connectivity",
		ZONE: "zone"
	}

	/** @type {Bridge} */
	_bridge;
	_data = {};
	_prepareUpdate = false;
	_update = {};
	_updateV1 = {};
	_events = {};
	_propagate = true;
	_called = false;

	constructor(bridge, data)
	{
		if (bridge)
			this._bridge = bridge;
		if (data)
		{
			this._setData(data);
			this._called = false;
		}
	}

	_setData(data, update = false)
	{
		this._called = true;
		this._id = `${data?.type}/${data?.id}`;
		this._data.id = data?.id;
		this._data.id_v1 = data?.id_v1;
		this._data.type = data?.type;
	}

	getObjectType()
	{return (this.constructor.name)}

	/**
	 * Gets the bridge of resource
	 * 
	 * @returns {Bridge} The bridge of resource
	 */
	getBridge()
	{return (this._bridge)};

	/**
	 * Gets the ID of resource
	 * 
	 * @returns {string} The ID of resource
	 */
	getID()
	{return (this._data.id)};

	/**
	 * Gets the old ID of resource
	 * 
	 * @returns {string} The old ID of resource
	 */
	getOldID()
	{return (this._data.id_v1)};

	/**
	 * Gets the type of resource
	 * 
	 * @returns {Resource.Type} The type of resource
	 */
	getType()
	{return (this._data.type)};

	/**
	 * Stop event propagation for the next emit()
	 * 
	 * @returns {Resource} This resource
	 */
	stopPropagation()
	{
		this._propagate = false;
		return (this);
	}

	/**
	 * Synchronously calls each of the listeners registered for the event named eventName, in the order they were registered, passing the supplied arguments to each.
	 * @param {string} eventName The event name
	 * @param  {...any} args 
	 */
	emit(eventName, ...args)
	{
		this._events[eventName]?.forEach?.(callback => callback(...args));
		this._propagate = true;
	}

	/**
	 * Adds the listener function to the end of the listeners array for the event named eventName
	 * 
	 * @param {string} eventName The event name
	 * @param {Function} listener The listener
	 */
	on(eventName, listener)
	{
		this._events[eventName] ??= [];
		this._events[eventName].push(listener);
	}

	/**
	 * Removes the specified listener from the listener array for the event named eventName.
	 * 
	 * @param {string} eventName The event name
	 * @param {Function} listener The listener to remove or not
	 */
	off(eventName, listener)
	{
		let index;

		if (arguments.length >= 2)
		{
			index = this._events[eventName]?.findIndex?.(func => func.toString() == listener.toString());
			if (index >= 0)
				this._events[eventName].splice(index, 1);
			if (!this._events[eventName])
				delete this._events[eventName];
		}
		else
			delete this._events[eventName];
	}

	prepareUpdate()
	{
		this._prepareUpdate = true;
		return (true);
	}

	async update(sender)
	{
		let url;

		if (!this._bridge)
			throw new Error("No brigde provided");
		if (Object.keys(this._update).length)
		{
			// console.log("SEND REQUEST", `https://${this._bridge._baseURL}/clip/v2/resource/${this._id}`, this._bridge._appKey, this._update);
			await new this._bridge._request(`https://${this._bridge._baseURL}/clip/v2/resource/${this._id}`)
			.put()
			.setStrictSSL(false)
			.setHeader("hue-application-key", this._bridge._appKey)
			.setBody(this._update)
			.execute();
			this._update = {};
		}
		if (Object.keys(this._updateV1).length)
		{
			for (let [type, data] of Object.entries(this._updateV1))
			{
				url = `https://${this._bridge._baseURL}/api/${this._bridge._appKey}${this.getOldID()}`;
				if (type)
					url += `/${type}`;
				// console.log("SEND REQUEST V1", data);
				await new this._bridge._request(url)
				.put()
				.setStrictSSL(false)
				.setBody(data)
				.execute();
			}
			this._updateV1 = {};
		}
		this._prepareUpdate = false;
	}
}