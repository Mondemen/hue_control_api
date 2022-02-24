import LightService from "../service/LightService.js";
import WhiteBulb from "./WhiteBulb.js";

export default class ColorBulb extends WhiteBulb
{
	static ColorUnit = LightService.ColorUnit;

	constructor(bridge, data)
	{
		super(bridge, data);
	}

	getColor(unit)
	{return (this._light.getColor(unit))}

	getRealColor(unit)
	{return (this._light.getRealColor(unit))}
}
