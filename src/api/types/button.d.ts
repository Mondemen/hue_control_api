import { ServiceGet } from "./service";

export type ButtonEvent = "initial_press" | "repeat" | "short_release" | "long_release" | "double_short_release" | "long_press";

export interface ButtonGet extends ServiceGet
{
	type: "button",
	/** Metadata describing this resource */
	metadata:
	{
		/**
		 * Control identifier of the switch which is unique per device. Meaning in combination with type – dots
		 * Number of dots – number Number printed on device – other a logical order of controls in switch
		 */
		control_id: number
	},
	button:
	{
		/**
		 * Move to button_report/event
		 * @deprecated
		 */
		last_event: ButtonEvent,
		button_report?:
		{
			/** Last time the value of this property is updated. */
			updated: Date,
			/** Event which can be send by a button control */
			event: ButtonEvent
		},
		/** Duration of a light transition or timed effects in ms. */
		repeat_interval?: number,
		/** List of all button events that this device supports */
		event_values?: ButtonEvent[]
	}
}
