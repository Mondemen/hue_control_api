import Bulb from "./Bulb.js";

export default class WhiteBulb extends Bulb
{
	constructor(bridge, data)
	{
		super(bridge, data);
	}

	getBrightness()
	{return (Math.max(this._light?.getBrightness?.() ?? 0, this.getMinBrightness()))}

	setBrightness(brightness)
	{
		brightness = Math.max(brightness, this.getMinBrightness());
		// this._spreadUpdateToLights = Object.values(this._light).filter(light => light.getState()).map(light => light.getID());
		this._spreadUpdateToLights = [this.getID()];
		return (this._light?.setBrightness?.(brightness, this) ?? ((this._prepareUpdate) ? true : Promise.resolve()));
	}
}
