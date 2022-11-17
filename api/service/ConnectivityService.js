import Service from "./Service.js";

export default class ConnectivityService extends Service
{
	/**
	 * The connectivity status
	 *
	 * @enum {string}
	 * @readonly
	 */
	static Status =
	{
		CONNECTED: "connected",
		DISCONNECTED: "disconnected",
		CONNECTIVITY_ISSUE: "connectivity_issue",
		UNIDIRECTIONAL_INCOMING: "unidirectional_incoming"
	}

	constructor(bridge, data)
	{
		super(bridge, data);
	}

	_setData(data, update = false)
	{
		super._setData(data, update);
		if (data?.status)
			this.emit("connectivity_status", this._data.status = data?.status);
	}

	/**
	 * Gets the current connectivity status
	 *
	 * @returns {ZigbeeConnectivityService.Status} The status
	 */
	getStatus()
	{return (this._data.status)}
}