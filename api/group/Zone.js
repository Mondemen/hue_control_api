import Light from "../light/Light.js";
import Resource from "../Resource.js";
import LightService from "../service/LightService.js";
import Group from "./Group.js";

/**
 * @typedef {import('./Group.js').EventCallback} EventCallbackInherit
 */

/**
 * @callback AddLightEvent
 * @param {Light} light - Added light
 *
 * @callback DeleteLightEvent
 * @param {Light} light - Deleted light
 *
 * @typedef EventCallbackTypes
 * @type {Object}
 * @property {AddLightEvent} add_light
 * @property {DeleteLightEvent} delete_light
 * @typedef {EventCallbackInherit & EventCallbackTypes} EventCallback
*/

export default class Zone extends Group
{
	constructor(bridge, data)
	{
		super(bridge, data);
	}

	_setData(data)
	{
		super._setData(data);
		data?.children?.forEach?.(light =>
		{
			if (!(light instanceof Resource))
				light = this._bridge?._resources?.[`${light.type ?? light.rtype}/${light.id ?? light.rid}`];
			if (light instanceof Resource)
				this._addService(light);
		})
	}

	_addService(service)
	{
		super._addService(service);
		if (service instanceof LightService)
		{
			service = service.getOwner();
			service?.addZone?.(this);
			this._addDevice(service);
		}
	}

	/**
	 * @template {keyof EventCallback} T
	 * @param {T} eventName The event name
	 * @param {EventCallback[T]} listener The listener
	 */
	on(eventName, listener)
	{return (super.on(eventName, listener))}

	/**
	 * @template {keyof EventCallback} T
	 * @param {T} eventName The event name
	 * @param {EventCallback[T]} listener The listener
	 */
	once(eventName, listener)
	{return (super.once(eventName, listener))}

	addLight(light)
	{
		checkParam(this, "addLight", "light", light, Light);
		return (super.addDevice(light));
	}

	removeLight(light)
	{
		checkParam(this, "removeLight", "light", light, Light);
		return (super.removeDevice(light));
	}

	getLights()
	{return (this.getDevices())}

	getLight(id)
	{return (this.getDevice(id))}
}
