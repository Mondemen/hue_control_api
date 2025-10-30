import Scene from "../api_old/Scene";
import SmartScene from "../api_old/SmartScene";
import ExtError from "./error";
import TimeSecond from "./time/TimeSecond";
import WeekTimeslot from "./WeekTimeslot";

export interface EventCallbacks
{
	timeslot_add: (weekTimeslot: WeekTimeslot, timeslot: Timeslot) => void;
	timeslot_delete: (weekTimeslot: WeekTimeslot, timeslot: Timeslot) => void;
	timeslot_time: (weekTimeslot: WeekTimeslot, timeslot: Timeslot, time: TimeSecond) => void;
	timeslot_scene: (weekTimeslot: WeekTimeslot, timeslot: Timeslot, scene: Scene) => void;
}

export default class Timeslot
{
	alive = true;
	_init = false;
	_smartScene: SmartScene;
	_weekTimeslot: WeekTimeslot;
	_index: number;
	_time: TimeSecond;
	_scene?: Scene;
	_updated = false;

	constructor(smartScene: SmartScene, weekTimeslot: WeekTimeslot, index: number)
	{
		this._smartScene = smartScene;
		this._weekTimeslot = weekTimeslot;
		this._index = index;
		this._time = new TimeSecond(this._smartScene, weekTimeslot, this);
	}

	[Symbol.for('nodejs.util.inspect.custom')]()
	{
		return ({
			index: this._index,
			time: this._time,
			scene: this._scene
		})
	}

	_setData(data: any)
	{
		this.alive = true;
		if (data?.start_time?.time)
		{
			this._time._setData(data.start_time.time);
			this._weekTimeslot._smartScene.emit("timeslot_time", this._weekTimeslot, this, this._time);
		}
		if (data?.target && data?.target?.rid !== this._scene?.getID())
			this._weekTimeslot._smartScene.emit("timeslot_scene", this._weekTimeslot, this, this._scene = this._smartScene.getBridge()?.getScene(data?.target?.rid) as Scene);
		if (!this._init)
			this._add();
	}

	_getData()
	{
		if (!this._scene)
			throw new ExtError("Scene not assignee");
		return ({
			start_time:
			{
				kind: "time",
				time: this._time._getData()
			},
			target:
			{
				rid: this._scene?.getID(),
				rtype: this._scene?.getType()
			}
		})
	}

	_add()
	{
		this._weekTimeslot._smartScene.emit("timeslot_add", this._weekTimeslot, this);
		this._init = true;
	}

	_delete()
	{this._weekTimeslot._smartScene.emit("timeslot_delete", this._weekTimeslot, this)}

	// emit(eventName, ...args)
	// {this._weekTimeslot._smartScene.emit(`timeslot_${eventName}`, this, ...args)}

	getIndex()
	{return (this._index)}

	getWeekTimeslot()
	{return (this._weekTimeslot)}

	getTime()
	{return (this._time)}

	getScene()
	{return (this._scene)}

	setScene(scene: Scene)
	{
		this._scene = scene;
		if (this._smartScene.isExists())
			this._updated = true;
		return (this);
	}
}