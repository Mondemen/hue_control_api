import { SensorGet } from "./sensor";

export type ContactState = "contact" | "no_contact";

export interface ContactGet extends SensorGet
{
	type: "contact",
	contact_report?:
	{
		/** Last time the value of this property is changed. */
		changed: Date,
		/** contact and no_contact are the states of the sensor after last state-change. */
		state: ContactState
	}
}
