import Group, { GroupEvents } from ".";
import { DeviceByType, DeviceType } from "../device";
import Accessory from "../device/Accessory";
import Light from "../device/Light";
import Scene from "../Scene";
import { ArcheType, PartialResource, ResourceIdentifier } from "../types/resource";
import { RoomCreate, RoomGet, RoomSet } from "../types/room";

export interface RoomEvents extends GroupEvents
{
	name: (name: string) => void;
	archetype: (archetype: ArcheType) => void;
	scene_added: (scene?: Scene) => void;
	scene_deleted: (scene: ResourceIdentifier<"scene">) => void;
	// smart_scene_added: (smartScene?: SmartScene) => void;
	// smart_scene_deleted: (smartScene: ResourceIdentifier<"smart_scene">) => void;
}

export default class Room extends Group
{
	declare protected toCreate: RoomCreate;
	declare protected toUpdate: RoomSet;

	children: ResourceIdentifier<"device">[] = []

	private name: string;
	private archetype: ArcheType;

	protected setData(data: PartialResource<RoomGet>)
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

	emit<T extends keyof RoomEvents>(eventName: T, ...args: Parameters<RoomEvents[T]>) {super.emit<any>(eventName, ...args)}
	on<T extends keyof RoomEvents>(eventName: T, listener: RoomEvents[T]) {return (super.on<any>(eventName, listener))}
	once<T extends keyof RoomEvents>(eventName: T, listener: RoomEvents[T]) {return (super.once<any>(eventName, listener))}
	off<T extends keyof RoomEvents>(eventName: T, listener: RoomEvents[T]) {super.off<any>(eventName, listener)}
	removeAllListeners<T extends keyof RoomEvents>(eventName: T) {super.removeAllListeners<any>(eventName)}

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
			this.toCreate ??= {children: [], metadata: {name: "New room", archetype}};
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

	// getAddableDevices()
	// {
	// 	// this.getO
	// }

	// getScenes()
	// {

	// }


	getDevices<T extends DeviceType>(type?: T): DeviceByType[T][]
	{return (this.children.filter(child => child.rtype === "device").map(child => this.registry.resources.device.get(child.rid)).filter(child => !type || child?.deviceType === type || (type === "accessory" && child instanceof Accessory)) as DeviceByType[T][])}

	getLights()
	{return (this.children.filter(child => child.rtype === "device").map(child => this.registry.resources.device.get(child.rid)).filter(child => child?.deviceType === "light") as Light[])}

	getScenes()
	{return (this.registry.resources.scene.filter(scene => scene.getGroup().getID() === this.id).array())}

	newScene()
	{return (new Scene(this.registry, this.ref as ResourceIdentifier<"room">))}

	async create()
	{
		await super.create();
	}

	async delete()
	{
		this.emit("deleted");
		await this.registry.delete(this);
	}
}