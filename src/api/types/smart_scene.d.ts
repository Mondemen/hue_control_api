import { ResourceGet, ResourceIdentifier } from "./resource"

export type WeekDay = "sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday";

export interface SmartSceneTimeslotGet
{
	start_time:
	{
		kind: "time" | "sunset",
		/** This property is only used when property "kind" is "time" */
		time:
		{
			hour: number,
			minute: number,
			second: number
		}
	},
	target: ResourceIdentifier
}

export interface DayTimeslotsGet
{
	timeslots: SmartSceneTimeslotGet[],
	recurrence: WeekDay[]
}

export interface SmartSceneGet extends ResourceGet
{
	type: "smart_scene",
	metadata:
	{
		/** Human readable name of a resource */
		name: string,
		/** Reference with unique identifier for the image representing the smart scene only accepting "rtype": "public_image" on creation */
		image?: ResourceIdentifier,
		/** Application specific data. Free format string. */
		appdata?: string
	},
	/**
	 * Group associated with this Smart Scene. All services in the group are part of this scene.
	 * If the group is changed the scene is update (e.g. light added/removed)
	 */
	group: ResourceIdentifier,
	/** Information on what is the light state for every timeslot of the day */
	week_timeslots: DayTimeslotsGet[],
	/** Duration of the transition from on one timeslot's scene to the other (defaults to 60000ms) */
	transition_duration: number,
	/** The active time slot in execution */
	active_timeslot?:
	{
		timeslot_id: number,
		weekday: WeekDay
	},
	/** The current state of the smart scene. The default state is "inactive" if no recall is provided */
	state: "active" | "inactive"
}

export interface SmartSceneTimeslotSet
{
	start_time:
	{
		kind: SmartSceneTimeslotGet["start_time"]["kind"],
		/** This property is only used when property "kind" is "time" */
		time?: SmartSceneTimeslotGet["start_time"]["time"]
	},
	target: ResourceIdentifier
}

export interface DayTimeslotsSet
{
	timeslots:SmartSceneTimeslotSet[],
	recurrence: WeekDay[]
}

export interface SmartSceneSet
{
	metadata?: Partial<Omit<SmartSceneGet["metadata"], "image">>,
	/** Information on what is the light state for every timeslot of the day */
	week_timeslots?: DayTimeslotsSet,
	recall?:
	{
		/** Activate will start the smart (24h) scene; deactivate will stop it */
		action: "activate" | "deactivate"
	},
	/** Duration of the transition from on one timeslot's scene to the other (defaults to 60000ms) */
	transition_duration?: number,
}


export type SmartSceneCreate = Omit<SmartSceneGet, keyof ResourceGet | "state" | "active_timeslot" | "transition_duration"> & Pick<SmartSceneSet, "recall" | "transition_duration">
