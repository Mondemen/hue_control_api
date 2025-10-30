export interface OnGet
{
	/** On/Off state of the light on=true, off=false */
	on: boolean
}

export type OnSet = Partial<OnGet>;
