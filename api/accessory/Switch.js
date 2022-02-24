import {checkParam} from "../../utils/index.js";
import Accessory from "./Accessory.js";
import ButtonService from "../service/ButtonService.js";

export default class Switch extends Accessory
{
	/** @type {Object.<number,ButtonService>} */
	_button = {};

	constructor(bridge, data)
	{
		super(bridge, data);
	}

	_addService(service)
	{
		super._addService(service);
		if (service instanceof ButtonService)
			this._button[service.getControlID()] = service;
	}

	getButton(id)
	{
		checkParam(this, "getButton", "id", id, Number);
		if (!this._button[id])
			throw new RangeError(`Unknown button ID '${id}'`);
		return (this._button[id]);
	}
}