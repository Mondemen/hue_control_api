import ConnectivityService from "./ConnectivityService.js";

export default class ZGPConnectivityService extends ConnectivityService
{
	constructor(bridge, data)
	{
		super(bridge, data);
	}

	_setData(data, update = false)
	{
		super._setData(data, update);
		this._data.source_id = data?.source_id;
	}

	/**
	 * Gets the source_id of the device
	 * 
	 * @returns {string} The source_id
	 */
	getSourceID()
	{return (this._data.source_id)}
}