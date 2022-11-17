import { checkParam } from "../../utils/index.js";
import Service from "./Service.js";

export default class LightLevelService extends Service
{
	constructor(bridge, data)
	{
		super(bridge, data);
	}

	_setData(data, update = false)
	{
		super._setData(data, update);
		if (data.enabled != undefined)
			this.emit("light_level_enabled", this._data.enabled = data.enabled);
		if (data?.light?.light_level != undefined)
			this.emit("light_level", this._data.light_level = data.light.light_level);
	}

	isEnabled()
	{return (this._data.enabled)}

	/**
	 * Enable or not the light level sensor
	 *
	 * @param {boolean} enabled - true if enabled, otherwise false
	 * @returns {LightLevelService|Promise} - Return this object if prepareUpdate() was called, otherwise returns Promise
	 */
	setEnabled(enabled, sender = this)
	{
		checkParam(this, "setEnabled", "enable", enabled, "boolean");
		this._update.enabled = enabled;
		if (sender._prepareUpdate)
		{
			sender._updatedService[this.getID()] = this;
			return (sender);
		}
		return (this.update());
	}

	getLevel()
	{return (this._data.light_level)}
}