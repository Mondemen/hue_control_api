import { UUID } from "crypto";
import { inspect } from "util";
import { string } from "yup";
import { PartialDeep } from "../../types/utils";
import ExtError from "../lib/error";
import { GradientEvents } from "../lib/Gradient";
import Palette, { PaletteEvents, ResourceWithPalette } from "../lib/Palette";
import SceneAction, { ResourceWithSceneAction } from "../lib/SceneAction";
import Light from "./device/Light";
import Room from "./group/Room";
import Zone from "./group/Zone";
import Registry from "./Registry";
import Resource, { ResourceEvents } from "./Resource";
import LightService from "./service/LightService";
import { PartialResource, ResourceIdentifier, ResourceType } from "./types/resource";
import { SceneActionSet, SceneGet, SceneSet, SceneSetNoRecall, SceneStatus } from "./types/scene";
import { sceneCreate, sceneUpdate } from "./validation/scene";

export interface SceneEvents extends ResourceEvents, GradientEvents, PaletteEvents
{
	name: (name: string) => void;
	appdata: (appdata: string) => void;
	auto_dynamic: (autoDynamic: boolean) => void;
	status: (status: SceneStatus) => void;
}

export default class Scene extends Resource
{
	static NativeImage =
	{
		BRIGHT: "732ff1d9-76a7-4630-aad0-c8acc499bb0b" as UUID,
		CONCENTRATE: "b90c8900-a6b7-422c-a5d3-e170187dbf8c" as UUID,
		DIMMED: "8c74b9ba-6e89-4083-a2a7-b10a1e566fed" as UUID,
		ENERGIZE: "7fd2ccc5-5749-4142-b7a5-66405a676f03" as UUID,
		NIGHTLIGHT: "28bbfeff-1a0c-444e-bb4b-0b74b88e0c95" as UUID,
		READ: "e101a77f-9984-4f61-aac8-15741983c656" as UUID,
		RELAX: "a1f7da49-d181-4328-abea-68c9dc4b5416" as UUID,
		REST: "11a09ad5-8d65-4e90-959b-f05981a9ab1b" as UUID
	} as const;

	protected toUpdate: SceneSetNoRecall = {};
	protected toCreate: PartialDeep<SceneGet> = {};

	protected type: ResourceType = "scene";

	private group: ResourceIdentifier<"room" | "zone">;
	private name: string;
	private image?: UUID;
	private appData?: string;
	private speed: number;
	private autoDynamic: boolean;
	private status: SceneStatus;
	private actions: Map<string, SceneAction> = new Map();
	private palette: Palette;

	constructor(registry: Registry, group?: ResourceIdentifier<"room" | "zone">)
	{
		super(registry);
		if (group)
			this.group = group;
	}

	/**
	 * Sets data
	 */
	protected setData(data: PartialResource<SceneGet>)
	{
		super.setData(data);
		if (data.metadata?.name && this.name !== data.metadata.name)
			this.emit("name", this.name = data.metadata.name);
		if (data.metadata?.image)
			this.image = data.metadata.image.rid;
		if (data.metadata?.appdata && this.appData !== data.metadata.appdata)
			this.emit("appdata", this.appData = data.metadata.appdata);
		if (data.group)
			this.group = data.group;
		if (typeof data.auto_dynamic === "boolean" && this.autoDynamic !== data.auto_dynamic)
			this.emit("auto_dynamic", this.autoDynamic = data.auto_dynamic);
		if (typeof data.speed === "number" && this.speed !== data.speed)
			this.emit("speed", this.speed = data.speed);
		if (data.status && this.status !== data.status)
			this.emit("status", this.status = data.status);
		data.actions?.forEach(action =>
		{
			if (!this.actions.has(action.target.rid))
				this.actions.set(action.target.rid,  new SceneAction(this as unknown as ResourceWithSceneAction, action.target.rid));
			SceneAction.setData(this.actions.get(action.target.rid), action);
		});
		this.actions.forEach((_, id) =>
		{
			if (!data.actions?.find(action => action.target.rid === id))
				this.actions.delete(id);
		});
		if (data.palette)
		{
			this.palette ??= new Palette(this as unknown as ResourceWithPalette);
			Palette.setData(this.palette, data.palette);
		}
	}

	emit<T extends keyof SceneEvents>(eventName: T, ...args: Parameters<SceneEvents[T]>)
	{
		// if (eventName.includes("event_start"))
		// 	this._group?._eventStart();
		// this._group?.emit<any>(`scene_${eventName}`, this, ...args);
		super.emit<any>(eventName, ...args);
	}
	on<T extends keyof SceneEvents>(eventName: T, listener: SceneEvents[T]) { return (super.on<any>(eventName, listener)) }
	once<T extends keyof SceneEvents>(eventName: T, listener: SceneEvents[T]) { return (super.once<any>(eventName, listener)) }
	off<T extends keyof SceneEvents>(eventName: T, listener: SceneEvents[T]) {super.off<any>(eventName, listener)}
	removeAllListeners<T extends keyof SceneEvents>(eventName: T) { return (super.removeAllListeners<any>(eventName)) }

	/**
	 * Get scene name
	 */
	getName()
	{return ((this.exists ? this.toUpdate.metadata?.name : this.toCreate.metadata?.name) ?? this.name)}

	/**
	 * Set scene name
	 */
	setName(name: string)
	{
		if (this.exists)
		{
			this.toUpdate.metadata ??= {};
			this.toUpdate.metadata.name = name;
			this.updatable = true;
		}
		else
		{
			this.toCreate.metadata ??= {};
			this.toCreate.metadata.name = name;
			this.creatable = true;
		}
		return (this);
	}

	/**
	 * Gets if the scene can automatically start dymanic on recall
	 */
	isAutoDynamic(): boolean
	{return ((this.exists ? this.toUpdate.auto_dynamic : this.toCreate.auto_dynamic) ?? this.autoDynamic)}

	/**
	 * Set scene if the scene recall shoud start dymamic automatically
	 */
	setAutoDynamic(autoDynamic: boolean)
	{
		if (this.exists)
		{
			this.toUpdate.auto_dynamic = autoDynamic;
			this.updatable = true;
		}
		else
		{
			this.toCreate.auto_dynamic = autoDynamic;
			this.creatable = true;
		}
		return (this);
	}

	/**
	 * Get scene image
	 */
	getImage()
	{return (this.image)}

	/**
	 * Set scene image
	 */
	setImage(image: UUID)
	{
		image = string().uuid().required().validateSync(image) as UUID;
		if (this.exists)
			throw new ExtError(1, "Image can be define only during the creation of the scene");
		this.toCreate.metadata ??= {};
		this.toCreate.metadata.image ??= {};
		this.toCreate.metadata.image.rid = image;
		this.toCreate.metadata.image.rtype = "public_image";
		this.creatable = true;
		return (this);
	}

	isNativeImage()
	{
		const image = this.getImage();

		if (image)
			return (Object.values(Scene.NativeImage).includes(image));
		return (false);
	}

	getGroup()
	{
		if (this.group.rtype === "room")
			return (this.registry.resources.room.get(this.group.rid) as Room);
		else if (this.group.rtype === "zone")
			return (this.registry.resources.zone.get(this.group.rid) as Zone);
		throw new ExtError("Scene must be linked to a group but not found in bridge");
	}

	getPalette()
	{return (this.palette)}

	/**
	 * Gets action data from light
	 */
	getAction(light: Light | LightService)
	{
		let id: UUID;

		if (light instanceof Light)
			id = light.lightServices[0].rid;
		else
			id = light.getID();
		if (!this.actions.has(id))
			this.actions.set(id, new SceneAction(this as unknown as ResourceWithSceneAction, id))
		return (this.actions.get(id) as SceneAction);
	}

	deleteAction(light: Light | LightService)
	{
		let id: UUID;

		if (light instanceof Light)
			id = light.lightServices[0].rid;
		else
			id = light.getID();
		this.actions.delete(id);
		return (this);
	}

	/**
	 * Gets the list of actions
	 */
	getActions()
	{return (this.actions.array())}

	async create()
	{
		if (this.exists)
			throw new ExtError(1);
		if (this.creatable)
		{
			this.toCreate.group = this.group;
			this.toCreate.actions = this.actions.mapArray(action => (action as unknown as {toCreate: SceneActionSet}).toCreate);
			if (this.toCreate.actions.length !== this.getGroup().getLights().length)
				throw new ExtError("Missing lights in scene creation");
			this.toCreate = await sceneCreate.validate(this.toCreate);
			await super.create();
			this.getGroup().emit("scene_added", this);
		}
	}

	async delete()
	{
		if (this.exists)
		{
			await this.registry.delete(this);
			this.getGroup().emit("scene_deleted", this.ref as ResourceIdentifier<"scene">);
		}
	}

	async update()
	{
		if (this.updatable)
		{
			this.toUpdate.actions = this.actions.mapArray(action => (action as unknown as {toUpdate: SceneActionSet}).toUpdate);
			this.toUpdate = await sceneUpdate.validate(this.toUpdate);
			console.log("UPDATE SCENE", inspect(this.toUpdate, false, null, true));
			await this.registry.update(this, this.toUpdate);
		}
	}

	async applyDynamic(brightness?: number, transitionTime?: number)
	{
		const toUpdate: SceneSet = {};

		if (!this.exists)
			await this.create();
		toUpdate.recall = {};
		toUpdate.recall.action = "dynamic_palette";
		if (typeof  brightness === "number")
			toUpdate.recall.dimming = {brightness};
		if (typeof  transitionTime === "number")
			toUpdate.recall.duration = transitionTime;
		await this.registry.update(this, toUpdate);
	}

	async applyStatic(brightness?: number, transitionTime?: number)
	{
		const toUpdate: SceneSet = {};

		if (!this.exists)
			await this.create();
		toUpdate.recall = {};
		toUpdate.recall.action = "static";
		if (typeof  brightness === "number")
			toUpdate.recall.dimming = {brightness};
		if (typeof  transitionTime === "number")
			toUpdate.recall.duration = transitionTime;
		await this.registry.update(this, toUpdate);
	}

	async activate(brightness: number, transitionTime?: number)
	{
		const toUpdate: SceneSet = {};

		if (!this.exists)
			await this.create();
		toUpdate.recall = {};
		toUpdate.recall.action = "active";
		if (typeof  brightness === "number")
			toUpdate.recall.dimming = {brightness};
		if (typeof  transitionTime === "number")
			toUpdate.recall.duration = transitionTime;
		await this.registry.update(this, toUpdate);
	}
}
