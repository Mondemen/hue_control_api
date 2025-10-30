export type DynamicStatus = "dynamic_palette" | "none";

export interface DynamicsGet
{
	/** Current status of the lamp with dynamics. */
	status: DynamicStatus,
	/** Statuses in which a lamp could be when playing dynamics. */
	status_value: DynamicStatus[],
	/**
	 * Speed of dynamic palette or effect. The speed is valid for the dynamic palette if the status is dynamic_palette
	 * or for the corresponding effect listed in status. In case of status none, the speed is not valid
	 */
	speed: number,
	/** Indicates whether the value presented in speed is valid */
	speed_valid: boolean
}

export interface DynamicsSet extends Partial<Pick<DynamicsGet, "speed">>
{
	/** Duration of a light transition or timed effects in ms. */
	duration?: number
}
