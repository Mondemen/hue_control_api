// import util from "util";
import ExtError, { ErrorCodes } from "../lib/error";
import EventEmitter from "../lib/EventEmitter";
import Request, { HTTPResponse } from "../lib/Request";
import Bridge from "./Bridge";

export interface EventCallbacks
{
	event_start: () => void,
	event_end: () => void,
	add_resource: (resource: Resource) => void,
	delete_resource: (resource: Resource) => void,
	update: (data: any) => void,
}

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
		GROUPED_MOTION: "grouped_motion",
		HOMEKIT: "homekit",
		LIGHT_LEVEL: "light_level",
		LIGHT: "light",
		MATTER: "matter",
		MOTION: "motion",
		PUBLIC_IMAGE: "public_image",
		RELATIVE_ROTARY: "relative_rotary",
		ROOM: "room",
		SCENE: "scene",
		SERVICE_GROUP: "service_group",
		SMART_SCENE: "smart_scene",
		TEMPERATURE: "temperature",
		ZGP_CONNECTIVITY: "zgp_connectivity",
		ZIGBEE_BRIDGE_CONNECTIVITY: "zigbee_bridge_connectivity",
		ZIGBEE_CONNECTIVITY: "zigbee_connectivity",
		ZIGBEE_DEVICE_DISCOVERY: "zigbee_device_discovery",
		ZONE: "zone"
	} as const

	protected _bridge?: Bridge;
	protected _type: typeof Resource.Type[keyof typeof Resource.Type];
	_init = false;
	protected _typeV1: string;
	_id: string;
	protected _prepareUpdate = false;
	protected _create: Record<string, any> = {};
	protected _createV1: Record<string, any> = {};
	protected _update: Record<string, any> = {};
	protected _updateV1: Record<string, any> = {};
	_exists = true;
	protected _called = false;
	_resources: Record<string, Resource> = {};
	_data: Record<string, any> = {};
	_updatedService: Record<string, Resource> = {};
	alive = false;

	constructor(bridge?: Bridge, data?: Record<string, any>)
	{
		super();
		if (bridge)
			this._bridge = bridge;
		if (data)
			this._setData(data);
	}

	[Symbol.for('nodejs.util.inspect.custom')]()
	{
		return ({
			_id: this._id,
			id: this._data.id ?? this._data.rid,
			id_v1: this._data.id_v1,
			type: this._data.type ?? this._data.rtype
		})
	}

	_setData(data: any)
	{
		this.alive = true;
		if (data?.id && data?.type)
			this._id = `${data?.type}/${data?.id}`;
		this._data.id = data?.id ?? this._data.id;
		this._data.id_v1 = data?.id_v1 ?? this._data.id_v1;
		this._data.type = data?.type ?? this._data.type;
	}

	protected _getFullData()
	{return ({})}

	_add()
	{
		this._bridge?.emit("add_resource", this);
		this._init = true;
	}

	_delete()
	{this._bridge?.emit("delete_resource", this)}

	getObjectType()
	{return (this.constructor.name)}

	/**
	 * Gets the bridge of resource
	 */
	getBridge()
	{return (this._bridge)}

	/**
	 * Gets the ID of resource
	 */
	getID(): string
	{return (this._data.id)}

	/**
	 * Gets the old ID of resource
	 */
	getOldID(): string
	{return (this._data.id_v1)}

	/**
	 * Gets the type of resource
	 */
	getType(): typeof Resource.Type[keyof typeof Resource.Type]
	{return (this._data.type)}

	/**
	 * Check if this resource exists in bridge
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

	_eventStart()
	{
		if (!this._called)
		{
			this.emit("event_start");
			this._called = true;
		}
	}

	protected _eventEnd(bridge = this._bridge)
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
			eventEnd(bridge?._resources[id]);
		eventEnd(bridge);
	}

	emit<T extends keyof EventCallbacks>(eventName: T, ...args: Parameters<EventCallbacks[T]>)
	{
		if (eventName.includes("event_start"))
			this._bridge?._eventStart();
		super.emit(eventName, ...args);
	}
	on<T extends keyof EventCallbacks>(eventName: T, listener: EventCallbacks[T]) {return (super.on(eventName, listener))}
	once<T extends keyof EventCallbacks>(eventName: T, listener: EventCallbacks[T]) {return (super.once(eventName, listener))}
	removeAllListeners<T extends keyof EventCallbacks>(eventName: T) {return (super.removeAllListeners(eventName))}

	private _errorManager(response: HTTPResponse | undefined)
	{
		const statusCode = response?.statusCode ?? -1;
		let messages = response?.data?.errors?.map(error => error.description) ?? [];

		if (messages.length)
			console.warn(messages);
		if (Object.values(ErrorCodes.http).includes(statusCode))
			throw new ExtError(statusCode, messages);
		throw new ExtError(-1);
	}

	async create()
	{
		let request: Request | undefined, response: HTTPResponse | undefined;
		let baseURL: string;
		let data: any;

		if (!this._bridge)
			throw new ExtError("No brigde provided");
		baseURL = this._bridge._baseURL;
		if (Object.keys(this._create).length)
		{
			if (this._bridge.remoteAccess)
				baseURL += "/route";
			// console.log("CREATE", `https://${baseURL}/clip/v2/resource/${this._type}`, this._create);
			request = this._bridge.request(`https://${baseURL}/clip/v2/resource/${this._type}`).post();
			request.setHeader("hue-application-key", this._bridge._appKey);
			request.setBody(this._create);
			this._create = {};
		}
		else if (Object.keys(this._createV1).length)
		{
			if (this._bridge.remoteAccess)
				baseURL += "/bridge";
			// console.log("CREATE V1", `https://${baseURL}/api/${this._bridge._appKey}/${this._typeV1}`, this._createV1);
			request = this._bridge.request(`https://${baseURL}/api/${this._bridge._appKey}/${this._typeV1}`).post();
			request.setBody(this._createV1);
			this._createV1 = {};
		}
		if (this._bridge.remoteAccess)
			request?.setHeader("Authorization", `Bearer ${this._bridge.remoteAccess.access_token}`);
		else
			request?.setStrictSSL(false);
		this._prepareUpdate = false;
		response = await request?.execute();
		this._errorManager(response);
		if (response?.data?.data?.[0])
			data = {type: response.data.data[0].rtype, id: response.data.data[0].rid};
		if (data)
			this._setData(data);
		else
			throw new ExtError(ErrorCodes.notCreated);
		return (data);
	}

	async delete()
	{
		let request;
		let response;
		let baseURL;

		if (!this._bridge)
			throw new ExtError("No brigde provided");
		baseURL = this._bridge._baseURL;
		if (this._bridge.remoteAccess)
			baseURL += "/route";
		// console.log("DELETE", `https://${baseURL}/clip/v2/resource/${this._id}`);
		request = this._bridge.request(`https://${baseURL}/clip/v2/resource/${this._id}`).delete();
		request.setHeader("hue-application-key", this._bridge._appKey);
		if (this._bridge.remoteAccess)
			request.setHeader("Authorization", `Bearer ${this._bridge.remoteAccess.access_token}`);
		else
			request.setStrictSSL(false);
		this._prepareUpdate = false;
		response = await request.execute();
		this._errorManager(response);
	}

	async update()
	{
		let promises: Promise<any>[] = [];
		let request: Request;
		let response: HTTPResponse[];
		let baseURL: string, url: string;

		if (!this._bridge)
			throw new ExtError("No brigde provided");
		promises.push(...Object.values(this._updatedService).map(service => service.update()));
		baseURL = this._bridge._baseURL;
		if (Object.keys(this._update).length)
		{
			if (this._bridge.remoteAccess)
				baseURL += "/route";
			// console.log("UPDATE", `https://${this._bridge._baseURL}/clip/v2/resource/${this._id}`, util.inspect(this._update, false, null, true));
			// return;
			request = this._bridge.request(`https://${baseURL}/clip/v2/resource/${this._id}`).put();
			request.setHeader("hue-application-key", this._bridge._appKey);
			if (this._bridge.remoteAccess)
				request.setHeader("Authorization", `Bearer ${this._bridge.remoteAccess.access_token}`);
			else
				request.setStrictSSL(false);
			request.setBody(this._update);
			promises.push(new Promise((resolve, reject) =>
			{
				request.execute().then(response =>
				{
					this._eventStart();
					this._setData(this._update);
					this._eventEnd(this._bridge);
					resolve(response);
				}).catch(reject).finally(() => this._update = {});
			}));
		}
		if (Object.keys(this._updateV1).length)
		{
			if (this._bridge.remoteAccess)
				baseURL += "/bridge";
			for (let [type, data] of Object.entries(this._updateV1))
			{
				url = `https://${baseURL}/api/${this._bridge._appKey}${this.getOldID()}`;
				if (type)
					url += `/${type}`;
				// console.log("UPDATE V1", url, data);
				// return;
				request = this._bridge.request(url).put();
				if (this._bridge.remoteAccess)
					request.setHeader("Authorization", `Bearer ${this._bridge.remoteAccess.access_token}`);
				else
					request.setStrictSSL(false);
				request.setBody(data);
				promises.push(request.execute());
			}
			this._updateV1 = {};
		}
		this._prepareUpdate = false;
		response = await Promise.all(promises);
		response.forEach((response: HTTPResponse) => this._errorManager(response));
	}
}