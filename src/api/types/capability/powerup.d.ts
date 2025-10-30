export type PowerupPreset = "safety" | "powerfail" | "last_on_state" | "custom";
export type PowerupStateMode = "on" | "toggle" | "previous";
export type PowerupDimmingMode = "dimming" | "previous";
export type PowerupColorMode = "color_temperature" | "color" | "previous";

export interface PowerupGet
{
	/** When setting the custom preset the additional properties can be set. For all other presets, no other properties can be included. */
	preset: PowerupPreset,
	/** Indicates if the shown values have been configured in the lightsource. */
	configured: boolean,
	on?:
	{
		/**
		 * State to activate after powerup. On will use the value specified in the “on” property.
		 * When setting mode “on”, the on property must be included. Toggle will alternate between on and
		 * off on each subsequent power toggle. Previous will return to the state it was in before powering off.
		 */
		mode: PowerupStateMode,
		on?:
		{
			/** On/Off state of the light on=true, off=false */
			on: boolean
		}
	},
	dimming?:
	{
		/**
		 * Dimming will set the brightness to the specified value after power up.
		 * When setting mode “dimming”, the dimming property must be included.
		 * Previous will set brightness to the state it was in before powering off.
		 */
		mode: PowerupDimmingMode,
		dimming?:
		{
			/** Brightness percentage. value cannot be 0, writing 0 changes it to lowest possible brightness */
			brightness: number
		}
	},
	color?:
	{
		/**
		 * State to activate after powerup. Availability of “color_temperature” and “color” modes depend on the capabilities of the lamp.
		 * Colortemperature will set the colortemperature to the specified value after power up. When setting color_temperature, the
		 * color_temperature property must be included Color will set the color tot he specified value after power up. When setting color
		 * mode, the color property must be included Previous will set color to the state it was in before powering off.
		 */
		mode: PowerupColorMode,
		color_temperature?:
		{
			/** Color temperature in mirek or null when the light color is not in the ct spectrum */
			mirek: number
		},
		color?:
		{
			/** CIE XY gamut position */
			xy:
			{
				/** X position in color gamut */
				x: number,
				/** Y position in color gamut */
				y: number
			}
		}
	}
}

export type PowerupSet = Partial<Omit<PowerupGet, "configured">> & Pick<PowerupGet, "preset">;
