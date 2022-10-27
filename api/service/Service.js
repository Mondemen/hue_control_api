import Device from "../Device.js";
import Resource from "../Resource.js";

export default class Service extends Resource
{
	/**
	 * @type {Device}
	 * @private
	 */
	_owner;
	
	constructor(bridge, data)
	{
		super(bridge, data);
	}

	setOwner(owner)
	{this._owner = owner}

	getOwner()
	{return (this._owner)}

	emit(eventName, ...args)
	{
		if (this._owner)
		{
			if (eventName.includes("event_start"))
				this._owner._eventStart();
			else if (!["event_start", "event_end"].includes(eventName))
				this._owner.emit(eventName, ...args);
		}
		super.emit(eventName, ...args);
	}
}