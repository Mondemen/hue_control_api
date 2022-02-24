import MinimalLengthError from "../../lib/error/MinimalLengthEror.js";
import Resource from "../Resource.js";
import GroupedLightService from "../service/GroupedLightService.js";

const numberAverage = numbers => numbers.reduce((p, c) => p + c, 0) / (numbers.length || 1);

/**
 * @typedef {import('../light/Light.js').default} Light
 */

export default class Group extends Resource
{
	static State = GroupedLightService.State;
	static ColorTemperatureUnit = GroupedLightService.ColorTemperatureUnit;
	static ColorUnit = GroupedLightService.ColorUnit;
	static AlertType = GroupedLightService.AlertType;

	/** @type {Object.<string,Light>} */
	_light = {};
	/** @type {GroupedLightService} */
	_groupedLight;
	_services = {};
	_spreadUpdateToLights = [];

	constructor(bridge, data)
	{
		super(bridge, data);
	}

	convertOldData(id, data, services)
	{
		let groupedLight = services?.groupedLightServices?.[id];
		let light, lights = [];
		let result =
		{
			id: this.getID(),
			id_v1: id,
			type: this.getType(),
			metadata:
			{
				name: data.name,
				archetype: data.class.replace(/\s/g, "_").toLowerCase()
			},
			children: [],
			services: []
		}

		lights = data.lights.map(id =>
		{
			light = services?.lightServices?.[`/lights/${id}`];
			if (light)
				return ({rid: light.getID(), rtype: light.getType()});
		}).filter(light => light);
		if (groupedLight)
			groupedLight = {rid: groupedLight.getID(), rtype: groupedLight.getType()};
		if (lights)
		{
			result.children = lights;
			result.services = [...result.services, ...lights];
		}
		if (groupedLight)
			result.services = [...result.services, groupedLight];
		return (result);
	}

	_setData(data, update = false)
	{
		super._setData(data, update);
		this._data.name = data?.metadata?.name ?? this._data.name;
		this._data.archetype = data?.metadata?.archetype ?? this._data.archetype;
		data?.services?.forEach(service =>
		{
			if (!(service instanceof Resource))
				service = this._bridge?._resources?.all?.[`${service.type ?? service.rtype}/${service.id ?? service.rid}`];
			if (service instanceof Resource)
				this._addService(service);
		});
		this._data.minBrightness = +Object.values(this._light).reduce((result, light) =>
		{
			if (light.getCapabilities().includes("dimming"))
				result = Math.min(result, light.getMinBrightness());
			return (result);
		}, (Object.keys(this._light).length) ? Infinity : 0).toFixed(2);
		this._updateFromChildren(null, null, update);
	}

	_addService(service)
	{
		this._services[service._id] = service;
		if (service instanceof GroupedLightService)
		{
			service.setOwner(this);
			this._groupedLight = service;
		}
	}

	_updateFromChildren(eventName, light, update = false)
	{
		let state, brightness;

		if (!this._groupedLight)
			return;
		if ((!eventName || eventName == "state") && light)
		{
			state = light.getState();
			if (this._spreadUpdateToLights.length)
			{
				Object.values(this._light).forEach(light =>
				{
					if (state != light._light?._data?.state)
					{
						light._light._data.state = state;
						if (update)
							light.stopPropagation().emit("state", light._light._data.state);
					}
				})
			}
			if (!this._spreadUpdateToLights.length)
				state = Object.values(this._light).reduce((result, light) => result || light.getState(), false);
			this._spreadUpdateToLights.pop();
			if (state != this._groupedLight._data.state)
			{
				this._groupedLight._data.state = state;
				if (update)
					this._groupedLight.emit("state", this._groupedLight._data.state);
			}
		}
		if (!eventName || eventName == "brightness")
		{
			if (light && this._spreadUpdateToLights.length)
				brightness = light.getBrightness();
			else
			{
				brightness = +numberAverage(Object.values(this._light).reduce((result, light) =>
				{
					if (light.getState())
						result.push(light.getBrightness())
					return (result);
				}, [])).toFixed(2);
			}
			brightness = Math.max(brightness, this.getMinBrightness());
			if (this._spreadUpdateToLights.length)
			{
				Object.values(this._light).forEach(light =>
				{
					// console.log("DISPATCH", brightness, light._data.brightness);
					if (light.getState() && brightness != light._light?._data?.brightness)
					{
						light._light._data.brightness = brightness;
						if (update)
						{
							light.stopPropagation().emit("brightness", light._light._data.brightness);
							light.stopPropagation().emit("real_color", {...light._data.color, brightness: (light._data.brightness ?? 0) / 100})
						}
					}
				})
			}
			this._spreadUpdateToLights.pop();
			if (brightness != this._groupedLight._data.brightness)
			{
				this._groupedLight._data.brightness = brightness;
				if (update)
					this._groupedLight.emit("brightness", this._groupedLight._data.brightness);
			}
		}
	}

	/**
	 * Gets the name
	 * 
	 * @returns {string} The name
	 */
	getName()
	{return (this._data.name)}

	/**
	 * Gets the arche type
	 * 
	 * @returns {string} The arche type
	 */
	getArchetype()
	{return (this._data.archetype)}

	 addLight(light)
	{
		// const Light = require("../light/Light.js").default;
		const lightIDRegex = /\/?\w+\//;

		this._updateV1[""] ??= {};
		this._updateV1[""].lights ??= Object.values(this._light).map(light => light.getOldID().replace(lightIDRegex, ""));
		this._updateV1[""].lights.push((light?._light ?? light).getOldID().replace(lightIDRegex, ""));
		if (this._prepareUpdate)
			return (this);
		return (this.update());
	}

	removeLight(light)
	{
		const lightIDRegex = /\/?\w+\//;
		let id;
		let index;

		this._updateV1[""] ??= {};
		this._updateV1[""].lights ??= Object.values(this._light).map(light => light.getOldID().replace(lightIDRegex, ""));
		if (this._updateV1[""].lights.length <= 1)
			throw new MinimalLengthError(this, "removeLight", this.getType(), "light", 1);
		id = (light?._light ?? light).getOldID().replace(lightIDRegex, "");
		if ((index = this._updateV1[""].lights.findIndex(light => light == id)) >= 0)
			this._updateV1[""].lights.splice(index, 1);
		if (this._prepareUpdate)
			return (this);
		return (this.update());
	}

	/**
	 * Gets the list of light in this group
	 * 
	 * @returns {Light[]} The list of light
	 */
	getLights()
	{return (Object.values(this._light))}

	getState()
	{return (this._groupedLight?.getState?.() ?? Group.State.OFF)}

	setState(state)
	{
		// this._spreadUpdateToLights = Object.values(this._light).filter(light => light.getState() != state).map(light => light.getID());
		this._spreadUpdateToLights = [this.getID()];
		return (this._groupedLight?.setState?.(state, this) ?? ((this._prepareUpdate) ? true : Promise.resolve()));
	}

	turnOn()
	{return (this.setState(Group.State.ON))}

	turnOff()
	{return (this.setState(Group.State.OFF))}

	getMinBrightness()
	{return (this._data.minBrightness)}

	getBrightness()
	{return (Math.max(this._groupedLight?.getBrightness?.() ?? 0, this.getMinBrightness()))}

	setBrightness(brightness)
	{
		brightness = Math.max(brightness, this.getMinBrightness());
		// this._spreadUpdateToLights = Object.values(this._light).filter(light => light.getState()).map(light => light.getID());
		this._spreadUpdateToLights = [this.getID()];
		return (this._groupedLight?.setBrightness?.(brightness, this) ?? ((this._prepareUpdate) ? true : Promise.resolve()));
	}
}
