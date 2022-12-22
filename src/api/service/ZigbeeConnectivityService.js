import ConnectivityService from "./ConnectivityService.js";

export default class ZigbeeConnectivityService extends ConnectivityService
{
	constructor(bridge, data)
	{
		super(bridge, data);
	}

	_setData(data, update = false)
	{
		super._setData(data, update);
		this._data.macAddress = data?.mac_address;
	}

	/**
	 * Gets the mac address of the device
	 *
	 * @returns {string} The mac address
	 */
	getMacAddress()
	{return (this._data.macAddress)}
}