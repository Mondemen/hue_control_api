import ErrorCodes from "./error/ErrorCodes.js";
import EventEmitter from "./EventEmitter.js";
import Bridge from "../api/Bridge.js";
import {hex_md5 as MD5} from "./MD5.js";

/**
 * @typedef {import('./Request.js').default} Request
 * @typedef {import('./MDNS.js').default} MDNS
 */

function	randomString(length)
{
    let result = "";
    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < length; i++)
    	result += chars.charAt(Math.floor(Math.random() * chars.length));
	return (result);
}

export default class Connector extends EventEmitter
{
	/** @private */
	_request;
	/** @private */
	_mdns;
	/** @private */
	_list = {};
	/** @private */
	_localLoaded = false;
	/** @private */
	_mdnsBrowser;
	/** @private */
	_isBrowsing = false;
	/** @private */
	_gateway =
	{
		hue: {}
	}

	/**
	 *
	 * @param {Request} request
	 * @param {MDNS} mdns
	 * @param {*} clientKeys
	 */
	constructor(request, mdns, clientKeys)
	{
		super();
		if (!request)
			throw new Error("No requestor provided");
		if (!mdns)
			throw new Error("No mdns provided");
		this._request = request;
		this._mdns = mdns;
		this._clientKeys = clientKeys;
	}

	mdnsBrowse()
	{
		this._mdnsBrowser = new this._mdns("hue");
		this._mdnsBrowser.on('ready', () => this._mdnsBrowser.start());
		this._mdnsBrowser.on('resolved', async endpoint =>
		{
			let checkConfig;
			let bridge = {};
			let getName = name => name?.split?.(/\s*[-.]\s*/)?.[0];

			if (Array.isArray(endpoint.addresses) && endpoint.addresses.length)
				bridge.ip = endpoint.addresses[0];
			if (endpoint?.txt?.bridgeid)
				bridge.id = endpoint.txt.bridgeid.toUpperCase();
			if (endpoint?.host)
				bridge.name = getName(endpoint.fullName) ?? getName(endpoint.name) ?? getName(endpoint.fullname);
			checkConfig = (await new this._request(`https://${bridge.ip}/api/0/config`).setStrictSSL(false).execute()).data;
			if (checkConfig?.bridgeid == bridge.id && !this._list[bridge.id])
			{
				this._list[bridge.id] = bridge;
				this.emit("hue_bridge_infos", this._list[bridge.id]);
			}
		});
	}

	async discoveryEndpointBrowse()
	{
		let res = (await new this._request(`https://discovery.meethue.com/`).execute()).data;
		let checkConfig;

		if (Array.isArray(res))
		{
			res.forEach(async endpoint =>
			{
				let bridge = {};

				if (endpoint?.internalipaddress)
					bridge.ip = endpoint.internalipaddress;
				if (endpoint?.id)
					bridge.id = endpoint.id.toUpperCase();
				if (endpoint?.name)
					bridge.name = endpoint.name;
				checkConfig = (await new this._request(`https://${bridge.ip}/api/0/config`).setStrictSSL(false).execute()).data;
				if (checkConfig?.bridgeid == endpoint.id && !this._list[bridge.id])
				{
					this._list[bridge.id] = bridge;
					this.emit("hue_bridge_infos", this._list[bridge.id]);
				}
			})
		}
	}

	async discover(force = false, timeout = 2)
	{
		return (new Promise((resolve, reject) =>
		{
			try
			{
				if (force)
					this._list = {};
				this._isBrowsing = true;
				this._mdnsBrowser?.stop?.()
				this.emit("discover_start");
				this.mdnsBrowse();
				setTimeout(async () =>
				{
					await this.discoveryEndpointBrowse();
					setTimeout(() =>
					{
						this._mdnsBrowser.stop();
						this._isBrowsing = false;
						this._localLoaded = true;
						this.emit("discover_end");
						resolve(Object.values(this._list));
					}, timeout * 1000 - 500);
				}, 500);
			}
			catch (error)
			{reject(error)}
		}));
	}

	async registerHueBridge(bridge, deviceID, timeout = 120)
	{
		let checkConfig;

		if (!bridge?.ip)
			throw new Error("Missing bridge IP");
		if (!bridge?.id)
			throw new Error("Missing bridge ID");
		if (!deviceID)
			throw new Error("Missing device ID");
		checkConfig = (await new this._request(`https://${bridge.ip}/api/0/config`).setStrictSSL(false).execute()).data;
		if (checkConfig?.bridgeid != bridge.id)
			throw new Error("Targeted bridge does not have an ID corresponding to the one provided in parameter");
		return (new Promise((resolve, reject) =>
		{
			let found = false, cancel = false;
			let register = async () =>
			{
				let result = await new this._request(`https://${bridge.ip}/api`)
				.post()
				.setStrictSSL(false)
				.setBody({devicetype: `Hue Control#${deviceID}`, generateclientkey: true})
				.execute();

				if (Array.isArray(result.data) && (result = result.data[0]))
				{
					if (result.error && !cancel)
						setTimeout(register, 500);
					else if (result.success && !cancel)
					{
						found = true;
						resolve({...bridge, appKey: result.success.username, clientKey: result.success.clientkey});
					}
				}
			}
			register();
			setTimeout(() =>
			{
				if (!found)
				{
					cancel = true;
					reject(new Error("Link button not pressed"));
				}
			}, timeout * 1000);
		}))
	}

	/**
	 * Gets bridge by ID
	 *
	 * @param {string} id The bridge ID
	 * @returns {Bridge} The bridge
	 */
	getHueBridge(id)
	{return (this._gateway.hue[id])}

	/**
	 * Load bridge from their login info and return it
	 *
	 * @async
	 * @param {string} id The bridge ID
	 * @param {string} appKey The application key
	 * @param {{access_token: string, refresh_token: string, expires_at: Date, token_type: string}} [remoteAccess] The remove access data
	 * @param {boolean} [connect=true] Connect or not the bridge
	 * @returns {Promise<Bridge>} The bridge
	 */
	async loadHueBridge(id, appKey, remoteAccess, connect = true)
	{
		let loaded = false;

		id = id?.toUpperCase?.();
		return (new Promise((resolve, reject) =>
		{
			if (this._gateway.hue[id])
				return (resolve(this._gateway.hue[id]))
			if (!this._isBrowsing && !this._localLoaded)
				this.discover();
			if (this._isBrowsing)
			{
				this.once("hue_bridge_infos", async gateway =>
				{
					if (gateway.id?.toUpperCase() == id)
					{
						loaded = true;
						if (this._gateway.hue[gateway.id])
							return (resolve(this._gateway.hue[gateway.id]))
						this._gateway.hue[gateway.id] = new Bridge(gateway.ip, appKey, undefined, this);
						resolve(this._gateway.hue[gateway.id]);
						if (connect)
							await this._gateway.hue[gateway.id].connect();
						this.emit("hue_bridge", this._gateway.hue[gateway.id]);
					}
				});
				this.once("discover_end", async () =>
				{
					if (loaded)
						return;
					if (!remoteAccess)
						resolve();
					else
					{
						if (this._gateway.hue[id])
							return (resolve(this._gateway.hue[id]))
						this._gateway.hue[id] = new Bridge("api.meethue.com", appKey, {...this._clientKeys, ...remoteAccess}, this);
						resolve(this._gateway.hue[id]);
						if (connect)
							await this._gateway.hue[id].connect();
						this.emit("hue_bridge", this._gateway.hue[id]);
					}
				});
			}
			else
				resolve();
		}));
	}

	registerAuthorizationCallback(callback)
	{this._authCallback = callback;}

	async getToken(bridgeID, appKey)
	{
		let req;
		let state = randomString(30);
		let authData, beforeTokenData, tokenData, bridgeData;
		let baseURL = "https://api.meethue.com";
		let authorizePath = "/v2/oauth2/authorize";
		let tokenPath = "/v2/oauth2/token";
		let realm, nonce, hash1, hash2, digestCode;

		// Authorize
		if (!this._authCallback)
			throw new Error("Missing the authorization callback, use registerAuthorizationCallback()");
		authData = await this._authCallback(
		{
			authorizationEndpoint: `${baseURL}${authorizePath}`,
			tokenEndpoint: `${baseURL}${tokenPath}`
		}, this._clientKeys.clientID, state);
		if (!authData.code)
			throw new Error("Missing the authorization code obtained from the remote portal");

		// Get NONCE
		req = new this._request(`https://api.meethue.com${tokenPath}`).post();
		req.setHeader("Content-Type", "application/x-www-form-urlencoded");
		req.setParam("code", authData.code);
		req.setParam("grant_type", "authorization_code");
		if (authData.codeVerifier)
			req.setParam("code_verifier", authData.codeVerifier);
		beforeTokenData = await req.execute();
		if (!beforeTokenData?.headers?.["www-authenticate"])
			throw new Error("Missing realm and nonce code in response");
		realm = /realm="(.*?)"/.exec(beforeTokenData.headers["www-authenticate"])[1];
		nonce = /nonce="(.*?)"/.exec(beforeTokenData.headers["www-authenticate"])[1];
		if (!realm)
			throw new Error("Missing realm in response");
		if (!nonce)
			throw new Error("Missing nonce in response");

		// Get Token
		hash1 = MD5(`${this._clientKeys.clientID}:${realm}:${this._clientKeys.clientSecret}`);
		hash2 = MD5(`${beforeTokenData.method}:${tokenPath}`);
		digestCode = MD5(`${hash1}:${nonce}:${hash2}`);
		req = new this._request(`https://api.meethue.com${tokenPath}`).post();
		req.setHeader("Content-Type", "application/x-www-form-urlencoded");
		req.setHeader("Authorization", `Digest username="${this._clientKeys.clientID}", realm="${realm}", nonce="${nonce}", uri="${tokenPath}", response="${digestCode}"`);
		req.setParam("grant_type", "authorization_code");
		req.setParam("code", authData.code);
		if (authData.codeVerifier)
			req.setParam("code_verifier", authData.codeVerifier);
		tokenData = await req.execute();
		console.log("TOKEN", tokenData.statusCode, tokenData.statusMessage, tokenData.data);

		// Get bridge
		req = new this._request("https://api.meethue.com/route/clip/v2/resource/bridge").get();
		req.setHeader("hue-application-key", appKey);
		req.setHeader("Authorization", `Bearer ${tokenData.data.access_token}`);
		bridgeData = await req.execute();
		if (bridgeData.statusCode != 200)
			throw {code: ErrorCodes.badAppKey};
		bridgeData = bridgeData.data?.data?.[0];
		if (bridgeData.bridge_id?.toUpperCase() != bridgeID)
			throw {code: ErrorCodes.badBridgeID};
		return ({
			access_token: tokenData.data.access_token,
			refresh_token: tokenData.data.refresh_token,
			expires_at: new Date(Date.now() + (tokenData.data.expires_in * 1000)),
			token_type: tokenData.data.token_type
		});
	}

	async getRefreshToken(remoteAccess)
	{
		let req;
		let beforeTokenData, tokenData;
		let tokenPath = "/v2/oauth2/token";
		let realm, nonce, hash1, hash2, digestCode;

		// Get NONCE
		req = new this._request(`https://api.meethue.com${tokenPath}`).post();
		req.setHeader("Content-Type", "application/x-www-form-urlencoded");
		req.setParam("grant_type", "authorization_code");
		beforeTokenData = await req.execute();
		if (!beforeTokenData?.headers?.["www-authenticate"])
			throw new Error("Missing realm and nonce code in response");
		realm = /realm="(.*?)"/.exec(beforeTokenData.headers["www-authenticate"])[1];
		nonce = /nonce="(.*?)"/.exec(beforeTokenData.headers["www-authenticate"])[1];
		if (!realm)
			throw new Error("Missing realm in response");
		if (!nonce)
			throw new Error("Missing nonce in response");

		// Get Refresh Token
		hash1 = MD5(`${this._clientKeys.clientID}:${realm}:${this._clientKeys.clientSecret}`);
		hash2 = MD5(`${beforeTokenData.method}:${tokenPath}`);
		digestCode = MD5(`${hash1}:${nonce}:${hash2}`);
		req = new this._request(`https://api.meethue.com${tokenPath}`).post();
		req.setHeader("Content-Type", "application/x-www-form-urlencoded");
		req.setHeader("Authorization", `Digest username="${this._clientKeys.clientID}", realm="${realm}", nonce="${nonce}", uri="${tokenPath}", response="${digestCode}"`);
		req.setParam("grant_type", "refresh_token");
		req.setParam("refresh_token", remoteAccess.refresh_token);
		tokenData = await req.execute();
		return ({
			access_token: tokenData.data.access_token,
			refresh_token: tokenData.data.refresh_token,
			expires_at: new Date(Date.now() + (tokenData.data.expires_in * 1000)),
			token_type: tokenData.data.token_type
		});
	}
}