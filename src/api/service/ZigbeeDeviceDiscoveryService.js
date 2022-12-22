import Service from "./Service.js";

export default class ZigbeeDeviceDiscoveryService extends Service
{
	/**
	 * The discovery status
	 *
	 * @readonly
	 * @enum {string}
	 */
	static Status =
	{
		ACTIVE: "active",
		READY: "ready"
	}

	/**
	 * @type {Set<string>}
	 * @private
	 */
	_searchCodes = new Set();

	constructor(bridge, data)
	{
		super(bridge, data);
	}

	[Symbol.for('nodejs.util.inspect.custom')]()
	{
		return ({
			...super[Symbol.for('nodejs.util.inspect.custom')](),
			...this._data,
			search_codes: this._searchCodes
		})
	}

	_setData(data, update = false)
	{
		super._setData(data, update);
		if (data?.status && this._data.status != data.status)
			this.emit("status", this._data.status = data.status);
	}

	/**
	 * Gets the current discovery status
	 *
	 * @returns {ZigbeeDeviceDiscoveryService.Status[keyof typeof ZigbeeDeviceDiscoveryService.Status]}
	 */
	getStatus()
	{return (this._data.macAddress)}

	addSearchCode(code)
	{
		checkParam(this, "addSearchCode", "code", code, "string");
		this._searchCodes.add(code);
		return (this);
	}

	deleteSearchCode(code)
	{
		checkParam(this, "deleteSearchCode", "code", code, "string");
		this._searchCodes.delete(code);
		return (this);
	}

	async update()
	{
		if (this._searchCodes.size)
		{
			this._update.action ??= {};
			this._update.action.search_codes = [...this._searchCodes];
		}
		await super.update();
		this._searchCodes.clear();
	}

	async search()
	{
		this._update.action ??= {};
		this._update.action.action_type = "search";
		await this.update();
	}
}
