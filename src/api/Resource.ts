import { UUID } from "crypto";
import EventEmitter from "../lib/EventEmitter";
import Registry from "./Registry";
import { ResourceGet, ResourceIdentifier, ResourcesResponseSet, ResourceType } from "./types/resource";
import { enumerable } from "../utils";
import ExtError from "../lib/error";
import { inspect } from "util";

export interface ResourceEvents
{
	created: () => void;
	updated: () => void;
	deleted: () => void;
}

export default class Resource extends EventEmitter
{
	protected registry: Registry;

	protected init = false;
	exists: boolean;

	protected toCreate = {};
	protected toUpdate = {};
	protected creatable = false;
	protected updatable = false;
	protected throttleUpdateTimer: NodeJS.Timeout | number | string | null = null;
	protected throttleUpdateDelay = 0;

	protected id: UUID;
	protected id_v1?: string;
	protected type: ResourceType;

	constructor(registry: Registry)
	{
		super();
		this.registry = registry;
		enumerable(false)(this, "_events");
		enumerable(false)(this, "_onceEvents");
		enumerable(false)(this, "registry");
		enumerable(false)(this, "toCreate");
		enumerable(false)(this, "toUpdate");
		enumerable(false)(this, "creatable");
		enumerable(false)(this, "updatable");
		enumerable(false)(this, "throttleUpdateTimer");
		enumerable(false)(this, "throttleUpdateDelay");
		enumerable(false)(this, "init");
	}

	static setData(resource: Resource | undefined, data: ResourceGet)
	{
		resource?.setData(data);
	}

	getID()
	{return (this.id)}

	getOldID()
	{return (this.id_v1)}

	getType()
	{return (this.type)}

	get ref(): ResourceIdentifier
	{return ({rid: this.id, rtype: this.type})}

	protected setData(data: ResourceGet)
	{
		this.exists = true;
		if (data.id)
			this.id = data.id;
		if (data.id_v1)
			this.id_v1 = data.id_v1;
		if (data.type)
			this.type = data.type;
	}

	emit<T extends keyof ResourceEvents>(eventName: T, ...args: Parameters<ResourceEvents[T]>) {super.emit(eventName, ...args)}
	on<T extends keyof ResourceEvents>(eventName: T, listener: ResourceEvents[T]) {return (super.on(eventName, listener))}
	once<T extends keyof ResourceEvents>(eventName: T, listener: ResourceEvents[T]) {return (super.once(eventName, listener))}
	off<T extends keyof ResourceEvents>(eventName: T, listener: ResourceEvents[T]) {super.off(eventName, listener)}
	removeAllListeners<T extends keyof ResourceEvents>(eventName: T) {super.removeAllListeners(eventName)}

	protected startThrottleTimerUpdate()
	{
		if (!this.throttleUpdateDelay)
			this.throttleUpdateTimer = null;
		else
			this.throttleUpdateTimer = setTimeout(() => this.throttleUpdateTimer = null, this.throttleUpdateDelay);
	}

	protected async create()
	{
		let response: ResourcesResponseSet | undefined;
		let resource: ResourceIdentifier | undefined;

		if (this.creatable)
		{
			console.log("CREATE", inspect(this.toCreate, false, null, true));
			response = await this.registry.create(this, this.toCreate);
			resource = response?.data.at(0);
			if (resource)
			{
				this.id = resource.rid;
				this.type = resource.rtype;
			}
			else
				throw new ExtError("An error occured during creation");
			this.creatable = false;
		}
	}

	protected async update()
	{
		if (this.throttleUpdateTimer === null && this.updatable)
		{
			// console.log("UPDATE", this.toUpdate);
			this.startThrottleTimerUpdate();
			await this.registry.update(this, this.toUpdate);
			this.toUpdate = {};
			this.updatable = false;
		}
	}
}
