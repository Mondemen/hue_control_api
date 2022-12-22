import Device from "../Device.js";

export default class Accessory extends Device
{
	constructor(bridge, data)
	{
		super(bridge, data);
	}

	_add()
	{
		super._add();
		this._bridge?.emit("add_accessory", this);
	}

	_delete()
	{
		super._delete();
		this._bridge?.emit("delete_accessory", this);
	}
}