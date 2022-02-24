import Device from "../Device.js";
import Resource from "../Resource.js";

export default class Service extends Resource
{
	/** @type {Device} */
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
		super.emit(eventName, ...args);
		this?._owner?.emit(eventName, ...args);
	}
}