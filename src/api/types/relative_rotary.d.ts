import { ServiceGet } from "./service";

export type RelativeRotaryAction = "start" | "repeat";
export type RelativeRotaryDirection = "lock_wise" | "counter_clock_wise";

export interface RelativeRotaryGet extends ServiceGet
{
	type: "relative_rotary",
	relative_rotary:
	{
		/**
		 * Renamed to RelativeRotaryReport. Indicate which type of rotary event is received
		 * @deprecated
		 */
		last_level:
		{
			/** Indicate which type of rotary event is received */
			action: RelativeRotaryAction,
			rotation:
			{
				/** A rotation opposite to the previous rotation, will always start with new start command. */
				direction: RelativeRotaryDirection,
				/** Amount of rotation since previous event in case of repeat, amount of rotation since start in case of a start_event. Resolution = 1000 steps / 360 degree rotation. */
				steps: number,
				/** Duration of rotation since previous event in case of repeat, amount of rotation since start in case of a start_event. duration is specified in miliseconds. */
				duration: number
			}
		},
		rotary_report:
		{
			/** Last time the value of this property is updated. */
			updated: Date,
			/** Indicate which type of rotary event is received */
			action: RelativeRotaryAction,
			rotation:
			{
				/** A rotation opposite to the previous rotation, will always start with new start command. */
				direction: RelativeRotaryDirection,
				/** Amount of rotation since previous event in case of repeat, amount of rotation since start in case of a start_event. Resolution = 1000 steps / 360 degree rotation. */
				steps: number,
				/** Duration of rotation since previous event in case of repeat, amount of rotation since start in case of a start_event. duration is specified in miliseconds. */
				duration: number
			}
		}
	}
}
