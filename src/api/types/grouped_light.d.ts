import { AlertGet, AlertSet } from "./capability/alert"
import { ColorSet } from "./capability/color"
import { ColorTemperatureDelta, ColorTemperatureSet } from "./capability/color_temperature"
import { DimmingDelta, DimmingGet, DimmingSet } from "./capability/dimming"
import { DynamicsSet } from "./capability/dynamics"
import { OnGet, OnSet } from "./capability/on"
import { SignalingGet, SignalingSet } from "./capability/signaling"
import { ServiceGet } from "./service"

export interface GroupedLightGet extends ServiceGet
{
	type: "grouped_light",
	/** Joined on control & aggregated on state.| – "on" is true if any light in the group is on */
	on?: OnGet,
	/** Joined dimming control – "dimming.brightness" contains average brightness of group containing turned-on lights only. */
	dimming?: Pick<DimmingGet, "brightness">,
	/** Joined alert control */
	alert?: AlertGet,
	signaling?: Pick<SignalingGet, "signal_values">,
}

export interface GroupedLightSet
{
	/** Joined on control & aggregated on state.| – "on" is true if any light in the group is on */
	on?: OnSet,
	/** Joined dimming control – “dimming.brightness” contains average brightness of group containing turned-on lights only. */
	dimming?: DimmingSet,
	dimming_delta?: DimmingDelta,
	color_temperature?: ColorTemperatureSet,
	color_temperature_delta?: ColorTemperatureDelta,
	color?: ColorSet,
	dynamics?: DynamicsSet,
	alert?: AlertSet,
	signaling?: SignalingSet,
}