export type AlertType = "breathe";

export interface AlertGet
{
	/** Alert effects that the light supports. */
	action_values: AlertType[]
}

export interface AlertSet
{
	action: AlertType
}