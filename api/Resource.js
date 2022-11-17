// import util from "util";
import ErrorCodes from "../lib/error/ErrorCodes.js";
import EventEmitter from "../lib/EventEmitter.js";

/**
 * @typedef {import('./Bridge.js').default} Bridge
 */

export default class Resource extends EventEmitter
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
		GEOLOCATION: "geolocation",
		GROUPED_LIGHT: "grouped_light",
		HOMEKIT: "homekit",
		LIGHT_LEVEL: "light_level",
		LIGHT: "light",
		MOTION: "motion",
		MATTER: "matter",
		PUBLIC_IMAGE: "public_image",
		ROOM: "room",
		SCENE: "scene",
		TEMPERATURE: "temperature",
		ZGP_CONNECTIVITY: "zgp_connectivity",
		ZIGBEE_BRIDGE_CONNECTIVITY: "zigbee_bridge_connectivity",
		ZIGBEE_CONNECTIVITY: "zigbee_connectivity",
		ZONE: "zone"
	}

	/**
	 * @type {Bridge}
	 * @protected
	 */
	_bridge;
	/** @protected */
	_type;
	/** @protected */
	_init = false;
	/** @protected */
	_typeV1;
	/** @protected */
	_id;
	/** @protected */
	_data = {};
	/** @protected */
	_prepareUpdate = false;
	/** @protected */
	_create = {};
	/** @protected */
	_createV1 = {};
	/** @protected */
	_updatedService = {};
	/** @protected */
	_update = {};
	/** @protected */
	_updateV1 = {};
	/** @protected */
	_exists = true;
	/** @protected */
	_alive = false;
	/** @protected */
	_called = false;

	constructor(bridge, data)
	{
		super();
		if (bridge)
			this._bridge = bridge;
		if (data)
			this._setData(data);
	}

	[Symbol.for('nodejs.util.inspect.custom')]()
	{
		let data = {...this._data};

		delete data.id;
		delete data.type;
		return (
		{
			_id: this._id,
			id: this._data.id ?? this._data.rid,
			type: this._data.type ?? this._data.rtype,
			data
		})
	}

	/**
	 * @protected
	 */
	_setData(data)
	{
		this._alive = true;
		if (data?.id && data?.type)
			this._id = `${data?.type}/${data?.id}`;
		this._data.id = data?.id ?? this._data.id;
		this._data.id_v1 = data?.id_v1 ?? this._data.id_v1;
		this._data.type = data?.type ?? this._data.type;
	}

	/**
	 * @private
	 */
	_getFullData()
	{return ({})}

	/**
	 * @private
	 */
	_add()
	{
		this._bridge?.emit("add_resource", this);
		this._init = true;
	}

	/**
	 * @private
	 */
	_delete()
	{this._bridge?.emit("delete_resource", this)}

	getObjectType()
	{return (this.constructor.name)}

	/**
	 * Gets the bridge of resource
	 *
	 * @returns {Bridge} The bridge of resource
	 */
	getBridge()
	{return (this._bridge)}

	/**
	 * Gets the ID of resource
	 *
	 * @returns {string} The ID of resource
	 */
	getID()
	{return (this._data.id)}

	/**
	 * Gets the old ID of resource
	 *
	 * @returns {string} The old ID of resource
	 */
	getOldID()
	{return (this._data.id_v1)}

	/**
	 * Gets the type of resource
	 *
	 * @returns {Resource.Type[keyof typeof Resource.Type]} The type of resource
	 */
	getType()
	{return (this._data.type)}

	/**
	 * Check if this resource exists in bridge
	 *
	 * @returns {boolean}
	 */
	isExists()
	{return (this._exists)}

	prepareUpdate()
	{
		this._prepareUpdate = true;
		return (this);
	}

	cancelUpdate()
	{
		this._prepareUpdate = false;
		return (this);
	}

	/**
	 * @protected
	 */
	_eventStart()
	{
		if (!this._called)
		{
			this.emit("event_start");
			this._called = true;
		}
	}

	/**
	 * @protected
	 */
	_eventEnd(bridge = this._bridge)
	{
		let eventEnd = resource =>
		{
			if (resource && resource._called)
			{
				resource.emit("event_end");
				resource._called = false;
			}
		}

		bridge?.getLights().forEach(light => eventEnd(light));
		for (const id in bridge?._resources)
			eventEnd(bridge._resources[id]);
		eventEnd(bridge);
	}

	emit(eventName, ...args)
	{
		if (eventName.includes("event_start"))
			this._bridge?._eventStart();
		super.emit(eventName, ...args);
	}

	/**
	 * @private
	 */
	_errorManager(response)
	{
		let messages = response?.data?.errors?.map(error => error.description) ?? [];

		if (messages.length)
			console.warn(messages);
		if (Object.values(ErrorCodes.http).includes(response?.statusCode))
			throw {code: response.statusCode, message: messages};
	}

	async create()
	{
		let request, response;
		let baseURL;
		let data;

		if (!this._bridge)
			throw new Error("No brigde provided");
		baseURL = this._bridge._baseURL;
		if (Object.keys(this._create).length)
		{
			if (this._bridge._remoteAccess)
				baseURL += "/route";
			// console.log("CREATE", `https://${baseURL}/clip/v2/resource/${this._type}`, this._create);
			request = this._bridge.request(`https://${baseURL}/clip/v2/resource/${this._type}`).post();
			request.setHeader("hue-application-key", this._bridge._appKey);
			request.setBody(this._create);
			this._create = {};
		}
		else if (Object.keys(this._createV1).length)
		{
			if (this._bridge._remoteAccess)
				baseURL += "/bridge";
			// console.log("CREATE V1", `https://${baseURL}/api/${this._bridge._appKey}/${this._typeV1}`, this._createV1);
			request = this._bridge.request(`https://${baseURL}/api/${this._bridge._appKey}/${this._typeV1}`).post();
			request.setBody(this._createV1);
			this._createV1 = {};
		}
		if (this._bridge._remoteAccess)
			request.setHeader("Authorization", `Bearer ${this._bridge._remoteAccess.access_token}`);
		else
			request.setStrictSSL(false);
		this._prepareUpdate = false;
		response = await request.execute();
		this._errorManager(response);
		if (response?.data?.data?.[0])
			data = {type: response.data.data[0].rtype, id: response.data.data[0].rid};
		if (data)
			this._setData(data);
		else
			throw {code: ErrorCodes.notCreated, message: ["Resource not create due to error"]}
		return (data);
	}

	async delete()
	{
		let request;
		let response;
		let baseURL;

		if (!this._bridge)
			throw new Error("No brigde provided");
		baseURL = this._bridge._baseURL;
		if (this._bridge._remoteAccess)
			baseURL += "/route";
		// console.log("DELETE", `https://${baseURL}/clip/v2/resource/${this._id}`);
		request = this._bridge.request(`https://${baseURL}/clip/v2/resource/${this._id}`).delete();
		request.setHeader("hue-application-key", this._bridge._appKey);
		if (this._bridge._remoteAccess)
			request.setHeader("Authorization", `Bearer ${this._bridge._remoteAccess.access_token}`);
		else
			request.setStrictSSL(false);
		this._prepareUpdate = false;
		response = await request.execute();
		this._errorManager(response);
	}

	async update()
	{
		let promises = [];
		let request;
		let response, tmpResponse;
		let baseURL, url;

		if (!this._bridge)
			throw new Error("No brigde provided");
		promises.push(...Object.values(this._updatedService).map(service => service.update()));
		baseURL = this._bridge._baseURL;
		if (Object.keys(this._update).length)
		{
			if (this._bridge._remoteAccess)
				baseURL += "/route";
			// console.log("UPDATE", `https://${this._bridge._baseURL}/clip/v2/resource/${this._id}`, util.inspect(this._update, false, null, true));
			// return;
			request = this._bridge.request(`https://${baseURL}/clip/v2/resource/${this._id}`).put();
			request.setHeader("hue-application-key", this._bridge._appKey);
			if (this._bridge._remoteAccess)
				request.setHeader("Authorization", `Bearer ${this._bridge._remoteAccess.access_token}`);
			else
				request.setStrictSSL(false);
			request.setBody(this._update);
			promises.push(new Promise(async (resolve, reject) =>
			{
				try
				{
					tmpResponse = await request.execute();
					this._eventStart();
					this._setData(this._update);
					this._eventEnd(this._bridge);
					resolve(tmpResponse);
				}
				catch (error) {reject(error)}
				finally {this._update = {}}
			}));
		}
		if (Object.keys(this._updateV1).length)
		{
			if (this._bridge._remoteAccess)
				baseURL += "/bridge";
			for (let [type, data] of Object.entries(this._updateV1))
			{
				url = `https://${baseURL}/api/${this._bridge._appKey}${this.getOldID()}`;
				if (type)
					url += `/${type}`;
				// console.log("UPDATE V1", url, data);
				// return;
				request = this._bridge.request(url).put();
				if (this._bridge._remoteAccess)
					request.setHeader("Authorization", `Bearer ${this._bridge._remoteAccess.access_token}`);
				else
					request.setStrictSSL(false);
				request.setBody(data);
				promises.push(request.execute());
			}
			this._updateV1 = {};
		}
		this._prepareUpdate = false;
		response = await Promise.all(promises);
		response.forEach(response => this._errorManager(response));
	}
}