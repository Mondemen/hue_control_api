import WhiteBulb from "./WhiteBulb.js";

export default class WhiteAmbianceBulb extends WhiteBulb
{
	constructor(bridge, data)
	{
		super(bridge, data);
	}

	getMinColorTemperature()
	{return (this._light.getMinColorTemperature())}

	getMaxColorTemperature()
	{return (this._light.getMaxColorTemperature())}

	getColorTemperature()
	{return (this._light.getColorTemperature())}

	getColorTemperatureMirek()
	{return (this._light.getColorTemperatureMirek())}

	setColorTemperature(value)
	{return (this._light.setColorTemperature(value, this))}
}
