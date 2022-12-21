import Bulb from "./Bulb.js";

export default class WhiteBulb extends Bulb
{
	constructor(bridge, data)
	{
		super(bridge, data);
	}

	getColorTemperature()
	{return (this._light.getColorTemperature())}

	getColorTemperatureMirek()
	{return (this._light.getColorTemperatureMirek())}
}
