import Group, { GroupEvents } from ".";
import Light from "../device/Light";
import Scene from "../Scene";
import { ArcheType, PartialResource, ResourceIdentifier } from "../types/resource";
import { ZoneCreate, ZoneGet, ZoneSet } from "../types/zone";

export interface ZoneEvents extends GroupEvents
{
	name: (name: string) => void;
	archetype: (archetype: ArcheType) => void;
	scene_added: (scene?: Scene) => void;
	scene_deleted: (scene: ResourceIdentifier<"scene">) => void;
	// smart_scene_added: (smartScene?: SmartScene) => void;
	// smart_scene_deleted: (smartScene: ResourceIdentifier<"smart_scene">) => void;
}

export default class Zone extends Group
{
	declare protected toCreate: ZoneCreate;
	declare protected toUpdate: ZoneSet;

	private name: string;
	private archetype: ArcheType;

	protected setData(data: PartialResource<ZoneGet>)
	{
		super.setData(data);
		if (data.metadata)
		{
			if (data.metadata.name && this.name !== data.metadata.name)
				this.emit("name", this.name = data.metadata.name);
			if (data.metadata.archetype && this.archetype !== data.metadata.archetype)
				this.emit("archetype", this.archetype = data.metadata.archetype);
		}
		if (!this.init)
		{
			this.emit("created");
			this.init = true;
		}
		else
			this.emit("updated");
	}

	emit<T extends keyof ZoneEvents>(eventName: T, ...args: Parameters<ZoneEvents[T]>) {super.emit<any>(eventName, ...args)}
	on<T extends keyof ZoneEvents>(eventName: T, listener: ZoneEvents[T]) {return (super.on<any>(eventName, listener))}
	once<T extends keyof ZoneEvents>(eventName: T, listener: ZoneEvents[T]) {return (super.once<any>(eventName, listener))}
	off<T extends keyof ZoneEvents>(eventName: T, listener: ZoneEvents[T]) {super.off<any>(eventName, listener)}
	removeAllListeners<T extends keyof ZoneEvents>(eventName: T) {super.removeAllListeners<any>(eventName)}

	get lights()
	{return (this.children.filter(child => child.rtype === "light") as ResourceIdentifier<"light">[])}


	getName()
	{return (!this.exists ? this.toCreate.metadata?.name : (this.toUpdate.metadata?.name ?? this.name))}

	setName(name: string)
	{
		if (!this.exists)
		{
			this.toCreate ??= {children: [], metadata: {name, archetype: this.archetype ?? "unknown_archetype"}};
			this.toCreate.metadata.name = name;
			this.creatable = true;
		}
		else
		{
			this.toUpdate.metadata ??= {};
			this.toUpdate.metadata.name = name;
			this.updatable = true;
		}
		return (this);
	}

	getArchetype()
	{return (!this.exists ? this.toCreate.metadata?.archetype : (this.toUpdate.metadata?.archetype ?? this.archetype))}

	setArchetype(archetype: ArcheType)
	{
		if (!this.exists)
		{
			this.toCreate ??= {children: [], metadata: {name: "New zone", archetype}};
			this.toCreate.metadata.archetype = archetype;
			this.creatable = true;
		}
		else
		{
			this.toUpdate.metadata ??= {};
			this.toUpdate.metadata.archetype = archetype;
			this.updatable = true;
		}
		return (this);
	}

	getLights()
	{return (this.children.filter(child => child.rtype === "light").map(child => this.registry.resources.light.get(child.rid)?.getOwner()).filter(Boolean) as Light[])}

	newScene()
	{return (new Scene(this.registry, this.ref as ResourceIdentifier<"zone">))}

	async create()
	{
		// VALIDATION
		await this.create();
	}

	async delete()
	{
		this.emit("deleted");
		await this.registry.delete(this);
	}
}