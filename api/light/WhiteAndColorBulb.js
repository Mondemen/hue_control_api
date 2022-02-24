import LightService from "../service/LightService.js";
import WhiteAmbianceBulb from "./WhiteAmbianceBulb.js";

export default class WhiteAndColorBulb extends WhiteAmbianceBulb
{
	constructor(bridge, data)
	{
		super(bridge, data);
	}

	getColor(unit)
	{return (this._light.getColor(unit))}

	getRealColor(unit)
	{return (this._light.getRealColor(unit))}
}
