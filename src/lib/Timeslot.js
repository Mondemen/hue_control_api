import Scene from "../api/Scene.js";
import SmartScene from "../api/SmartScene.js";
import {checkParam} from "../utils/index.js";
import TimeSecond from "./time/TimeSecond.js";

/** @typedef {import('./WeekTimeslot.js').default} WeekTimeslot */

/**
 * @callback AddEvent
 * @param {WeekTimeslot} weekTimeslot - Week timeslot
 * @param {Timeslot} timeslot - Timeslot
 *
 * @callback DeleteEvent
 * @param {WeekTimeslot} weekTimeslot - Week timeslot
 * @param {Timeslot} timeslot - Timeslot
 *
 * @callback TimeEvent
 * @param {WeekTimeslot} weekTimeslot - Week timeslot
 * @param {Timeslot} timeslot - Timeslot
 * @param {TimeSecond} time - Time
 *
 * @callback SceneEvent
 * @param {WeekTimeslot} weekTimeslot - Week timeslot
 * @param {Timeslot} timeslot - Timeslot
 * @param {Scene} scene - Scene target
 */

export default class Timeslot
{
	/**
	 * @type {boolean}
	 * @private
	 */
	_alive = true;
	/**
	 * @type {boolean}
	 * @private
	 */
	_init = false;
	/**
	 * @type {SmartScene}
	 * @private
	 */
	_smartScene;
	/**
	 * @type {WeekTimeslot}
	 * @private
	 */
	_weekTimeslot;
	/**
	 * @type {number}
	 * @private
	 */
	_index;
	/**
	 * @type {TimeSecond}
	 * @private
	 */
	_time;
	/**
	 * @type {Scene}
	 * @private
	 */
	_scene;
	/**
	 * @type {boolean}
	 * @private
	 */
	_updated = false;

	constructor(smartScene, weekTimeslot, index)
	{
		this._smartScene = smartScene;
		this._weekTimeslot = weekTimeslot;
		this._index = index;
		this._time = new TimeSecond(this._smartScene, this);
	}

	[Symbol.for('nodejs.util.inspect.custom')]()
	{
		return ({
			index: this._index,
			time: this._time,
			scene: this._scene
		})
	}

	/**
	 * @private
	 */
	_setData(data)
	{
		this._alive = true;
		if (data?.start_time?.time)
		{
			this._time._setData(data.start_time.time);
			this.emit("time", this._time);
		}
		if (data?.target && data?.target?.rid != this._scene?.getID())
			this.emit("scene", this._scene = this._smartScene.getBridge().getScene(data?.target?.rid));
		if (!this._init)
			this._add();
	}

	/**
	 * @private
	 */
	_getData()
	{
		return ({
			start_time:
			{
				kind: "time",
				time: this._time._getData()
			},
			target:
			{
				rid: this._scene.getID(),
				rtype: this._scene.getType()
			}
		})
	}

	/**
	 * @private
	 */
	_add()
	{
		this.emit("add");
		this._init = true;
	}

	/**
	 * @private
	 */
	_delete()
	{this.emit("delete")}

	/**
	 * @private
	 */
	emit(eventName, ...args)
	{this._weekTimeslot.emit(`timeslot_${eventName}`, this, ...args)}

	getIndex()
	{return (this._index)}

	getWeekTimeslot()
	{return (this._weekTimeslot)}

	getTime()
	{return (this._time)}

	getScene()
	{return (this._scene)}

	setScene(scene)
	{
		checkParam(this, "setScene", "scene", scene, Scene);
		this._scene = scene;
		if (this._smartScene.isExists())
		{
			this._updated = true;
			if (!this._smartScene._prepareUpdate)
				return (this._smartScene.update());
		}
		return (this);
	}
}