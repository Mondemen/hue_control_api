import Resource from "./Resource.js";
import Light from "./light/Light.js";
import SceneAction from "../lib/SceneAction.js";
import Palette from "../lib/Palette.js";
import {checkParam} from "../utils/index.js";
import ErrorCodes from "../lib/error/ErrorCodes.js";

/**
 * @typedef {import('./group/Group.js').default} Group
 * @typedef {import('./Resource.js').EventCallback} EventCallbackInherit
 */

/**
 * @callback NameEvent
 * @param {string} name - Name of device
 *
 * @callback AutoDynamicEvent
 * @param {boolean} autoDynamic - Archetype of device
 *
 * @typedef EventCallbackTypes
 * @type {Object}
 * @property {NameEvent} name
 * @property {import("../lib/SceneAction.js").ActionStateEvent} action_state
 * @property {import("../lib/SceneAction.js").ActionBrightnessEvent} action_brightness
 * @property {import("../lib/SceneAction.js").ActionColorTemperatureEvent} action_color_temperature
 * @property {import("../lib/SceneAction.js").ActionColorTemperatureMiredEvent} action_color_temperature_mired
 * @property {import("../lib/SceneAction.js").ActionColorEvent} action_color
 * @property {import("../lib/SceneAction.js").ActionColorXYEvent} action_color_xy
 * @property {import("../lib/SceneAction.js").ActionEffectEvent} action_effect
 * @property {import("../lib/Gradient.js").ActionGradientColorEvent} action_gradient_color
 * @property {import("../lib/Gradient.js").ActionGradientColorXYEvent} action_gradient_color_xy
 * @property {import("../lib/SceneAction.js").ActionDuration} action_duration
 * @property {AutoDynamicEvent} auto_dynamic
 * @property {import("../lib/Palette.js").SpeedEvent} speed
 * @typedef {EventCallbackInherit & EventCallbackTypes} EventCallback
 */

export default class Scene extends Resource
{
	/**
	 * Image of scene
	 *
	 * @enum {string}
	 * @readonly
	 */
	static Image =
	{
		BRIGHT: "732ff1d9-76a7-4630-aad0-c8acc499bb0b",
		CONCENTRATE: "b90c8900-a6b7-422c-a5d3-e170187dbf8c",
		DIMMED: "8c74b9ba-6e89-4083-a2a7-b10a1e566fed",
		ENERGIZE: "7fd2ccc5-5749-4142-b7a5-66405a676f03",
		NIGHTLIGHT: "28bbfeff-1a0c-444e-bb4b-0b74b88e0c95",
		READ: "e101a77f-9984-4f61-aac8-15741983c656",
		RELAX: "a1f7da49-d181-4328-abea-68c9dc4b5416",
		REST: "11a09ad5-8d65-4e90-959b-f05981a9ab1b"
	}

	/** @private */
	_type = "scene";
	/**
	 * @type {Group}
	 * @private
	 * */
	_group;
	/**
	 * @type {Object<string, SceneAction}
	 * @private
	 * */
	_actions = {};
	/**
	 * @type {Palette}
	 * @private
	*/
	_palette = new Palette(this);

	constructor(bridge, data)
	{
		super(bridge, data);
	}

	[Symbol.for('nodejs.util.inspect.custom')]()
	{
		return (
		{
			...super[Symbol.for('nodejs.util.inspect.custom')](),
			group: this._group,
			actions: this._actions,
			palette: this._palette
		})
	}

	/**
	 * Sets data
	 *
	 * @private
	 * @param {Object} data The data
	 */
	_setData(data)
	{
		let light;

		super._setData(data);
		if (data?.metadata?.name != undefined && this._data.name != data?.metadata?.name)
			this.emit("name", this._data.name = data?.metadata?.name);
		this._data.image = data?.metadata?.image?.rid ?? this._data.image;
		if (data?.auto_dynamic != undefined && this._data.auto_dynamic != data?.auto_dynamic)
			this.emit("auto_dynamic", this._data.auto_dynamic = data.auto_dynamic);
		data?.actions?.forEach(action =>
		{
			light = this._bridge._resources[`${action.target.rtype}/${action.target.rid}`].getOwner?.();
			if (light)
			{
				this._actions[light.getID()] ??= new SceneAction(this, light);
				this._actions[light.getID()]._setData(action.action);
			}
		})
		this._palette._setData(data);
	}

	_add()
	{
		super._add();
		this._bridge?.emit("add_scene", this);
		this._group?.emit("add_scene", this);
	}

	_delete()
	{
		super._delete();
		this._bridge?.emit("delete_scene", this);
		this._group?.emit("delete_scene", this);
		this._group?._deleteScene(this);
	}

	/**
	 * Sets the group
	 *
	 * @private
	 * @param {Group} group The group
	 */
	_setGroup(group)
	{
		if (group instanceof this._bridge.Object.Group)
			this._group = group;
	}

	emit(eventName, ...args)
	{
		if (eventName.includes("event_start"))
			this._group?._eventStart();
		this._group?.emit?.(`scene_${eventName}`, this, ...args);
		super.emit(eventName, ...args);
	}

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

	getName()
	{
		if (this.isExists())
			return (this._update.metadata?.name ?? this._data.name)
		return (this._create.metadata?.name);
	}

	/**
	 * Set scene name
	 *
	 * @param {string} name - The name
	 * @returns {Scene|Promise} Return this object if prepareUpdate() was called, otherwise returns Promise
	 */
	setName(name)
	{
		let data = (this.isExists()) ? this._update : this._create;

		data.metadata ??= {};
		data.metadata.name = name;
		if (this.isExists() && !this._prepareUpdate)
			return (this.update());
		return (this);
	}

	/**
	 * Gets if the scene can automatically start dymanic on recall
	 *
	 * @returns {boolean}
	 */
	isAutoDynamic()
	{return (this._update.auto_dynamic ?? this._data.auto_dynamic)}

	/**
	 * Set scene if the scene recall shoud start dymamic automatically
	 *
	 * @param {boolean} autoDynamic - True if recall start dymamic automatically
	 * @returns {Scene|Promise} Return this object if prepareUpdate() was called, otherwise returns Promise
	 */
	setAutoDynamic(autoDynamic)
	{
		let data = (this.isExists()) ? this._update : this._create;

		data.auto_dynamic = autoDynamic;
		if (this.isExists() && !this._prepareUpdate)
			return (this.update());
		return (this);
	}

	getImage()
	{return (this._data.image)}

	/**
	 * Set scene image
	 *
	 * @param {Scene.Image[keyof typeof Scene.Image]} image - The image
	 * @returns {Scene} Return this object
	 */
	setImage(image)
	{
		checkParam(this, "setImage", "image", image, "string");
		if (!/^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$/.test(image))
			throw {code: ErrorCodes.badUUID, message: "Image ID does not match with accepted pattern (uuid v4)"};
		if (this.isExists())
			throw {code: ErrorCodes.alreadyExists, message: "Image can be define only during the creation of the scene"};
		this._create.metadata ??= {};
		this._create.metadata.image ??= {};
		this._create.metadata.image.rid = image;
		this._create.metadata.image.rtype = Resource.Type.PUBLIC_IMAGE;
		return (this);
	}

	isNative()
	{return (Object.values(Scene.Image).includes(this.getImage()))}

	getGroup()
	{return (this._group)}

	getPalette()
	{return (this._palette)}

	/**
	 * Gets action data from light
	 *
	 * @param {Light} light The light
	 * @returns {SceneAction}
	 */
	getAction(light)
	{
		checkParam(this, "getAction", "light", light, Light);
		this._actions[light.getID()] ??= new SceneAction(this, light);
		return (this._actions[light.getID()]);
	}

	/**
	 * Gets the list of actions
	 *
	 * @returns {SceneAction[]}
	 */
	getActions()
	{return (Object.values(this._actions))}

	async create()
	{
		let actions;
		let colorLight, miredLight;

		if (this.isExists())
			throw {code: ErrorCodes.alreadyExists};
		actions = Object.values(this._actions);
		colorLight = actions.find(action => action._data?.color?.xy);
		miredLight = actions.find(action => action._data?.color_temperature?.mirek);
		if (!this._palette.getColors().length && colorLight)
			this._palette.addColor(colorLight._data.color.xy, colorLight.getBrightness());
		if (!this._palette.getColorTemperature() && miredLight)
			this._palette.setColorTemperature(miredLight.getColorTemperature(), miredLight.getBrightness());
		this._create =
		{
			type: this._type,
			...this._create,
			group:
			{
				rid: this._group.getID(),
				rtype: this._group.getType()
			},
			actions: actions.map(action => action._getData()),
			...this._palette._getData()
		};
		await super.create();
		this._exists = true;
		this._group._addScene(this);
	}

	async delete()
	{
		if (!this.isExists())
			throw {code: ErrorCodes.notExists};
		await super.delete();
		this._group?._deleteScene(this);
	}

	async update()
	{
		if (!this.isExists())
			throw {code: ErrorCodes.notExists};
		if (Object.values(this._actions).find(action => action._updated))
			this._update.actions = Object.values(this._actions).map(action => action._getData());
		this._update = {...this._update, ...this._palette._getData()};
		await super.update();
	}

	async applyDynamic(brightness, transitionTime)
	{
		let isExists = this.isExists();
		let error;

		if (!isExists)
			await this.create();
		this._update.recall = {action: "dynamic_palette"};
		if (brightness != undefined)
			this._update.recall.dimming = {brightness};
		if (transitionTime != undefined)
			this._update.recall.duration = transitionTime;
		try
		{await this.update()}
		catch (err)
		{error = err}
		finally
		{this._update = {}}
		if (!isExists)
			await this.delete();
		if (error)
			throw error;
	}

	async applyStatic(brightness, transitionTime)
	{
		let isExists = this.isExists();
		let error;

		if (!isExists)
			await this.create();
		this._update.recall = {action: "static"};
		if (brightness != undefined)
			this._update.recall.dimming = {brightness};
		if (transitionTime != undefined)
			this._update.recall.duration = transitionTime;
		try
		{await this.update()}
		catch (err)
		{error = err}
		finally
		{this._update = {}}
		if (!isExists)
			await this.delete();
		if (error)
			throw error;
	}

	async activate(brightness, transitionTime)
	{
		let isExists = this.isExists();
		let error;

		if (!isExists)
			await this.create();
		this._update.recall = {action: "active"};
		if (brightness != undefined)
			this._update.recall.dimming = {brightness};
		if (transitionTime != undefined)
			this._update.recall.duration = transitionTime;
		try
		{await this.update()}
		catch (err)
		{error = err}
		finally
		{this._update = {}}
		if (!isExists)
			await this.delete();
		if (error)
			throw error;
	}
}
