import Bridge from "../api/Bridge.js";
import {hex_md5 as MD5} from "./MD5.js";

function	randomString(length)
{
    let result = "";
    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < length; i++)
    	result += chars.charAt(Math.floor(Math.random() * chars.length));
	return (result);
}

export default class Connector
{
	_request;
	_mdns;
	_list = {};
	_localLoaded = false;
	_events = {};
	_onceEvents = {};
	_mdnsBrowser;
	_isBrowsing = false;
	_gateway =
	{
		hue: {}
	}

	constructor(request, mdns)
	{
		if (!request)
			throw new Error("No requestor provided");
		if (!mdns)
			throw new Error("No mdns provided");
		this._request = request;
		this._mdns = mdns;
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
				this.mdnsBrowse();
				setTimeout(() => this.discoveryEndpointBrowse(), 500);
				setTimeout(() =>
				{
					this._mdnsBrowser.stop();
					this._isBrowsing = false;
					this._localLoaded = true;
					resolve(Object.values(this._list));
				}, timeout * 1000);
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

	getHueBridge(id)
	{return (this._gateway.hue[id])}

	async loadHueBridge(id, appKey, remoteAccess, connect = true)
	{
		id = id?.toUpperCase?.();
		return (new Promise((resolve, reject) =>
		{
			let resolved = false;
			let listener;

			if (this._gateway.hue[id])
				return (resolve(this._gateway.hue[id]))
			if (!this._isBrowsing && !this._localLoaded)
			{
				this.discover().then(gateway =>
				{
					if (!resolved)
						resolve();
				})
			}
			if (this._isBrowsing)
			{
				this.once("hue_bridge_infos", async gateway =>
				{
					if (gateway.id?.toUpperCase() == id)
					{
						this.off("hue_bridge_infos", listener);
						resolved = true;
						if (this._gateway.hue[gateway.id])
							return (resolve(this._gateway.hue[gateway.id]))
						this._gateway.hue[gateway.id] = new Bridge(gateway.ip, appKey, undefined, this._request);						
						resolve(this._gateway.hue[gateway.id]);
						if (connect)
							await this._gateway.hue[gateway.id].connect();
						this.emit("hue_bridge", this._gateway.hue[gateway.id]);
					}
				});
			}
			// else if ()
			else
				resolve();
		}));
	}

	registerAuthorizationCallback(callback)
	{this._authCallback = callback;}

	async getToken(clientID, clientSecret)
	{
		let req;
		let state = randomString(30);
		let authData, beforeTokenData, tokenData;
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
		}, clientID, state);
		if (!authData.code)
			throw new Error("Missing the authorization code obtained from the remote portal");

		// Get NONCE
		req = new this._request(`https://api.meethue.com${tokenPath}`)
		req.post();
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
		hash1 = MD5(`${clientID}:${realm}:${clientSecret}`);
		hash2 = MD5(`${beforeTokenData.method}:${tokenPath}`);
		digestCode = MD5(`${hash1}:${nonce}:${hash2}`);
		req = new this._request(`https://api.meethue.com${tokenPath}`);
		req.post();
		req.setHeader("Content-Type", "application/x-www-form-urlencoded");
		req.setHeader("Authorization", `Digest username="${clientID}", realm="${realm}", nonce="${nonce}", uri="${tokenPath}", response="${digestCode}"`);
		req.setParam("grant_type", "authorization_code");
		req.setParam("code", authData.code);
		if (authData.codeVerifier)
			req.setParam("code_verifier", authData.codeVerifier);
		tokenData = await req.execute();
		console.log("TOKEN", tokenData.data);
	}

	newRemoteConnection(clientID, clientSecret)
	{
		this.getToken(clientID, clientSecret);
	}

	/**
	 * Synchronously calls each of the listeners registered for the event named eventName, in the order they were registered, passing the supplied arguments to each.
	 * @param {string} eventName The event name
	 * @param  {...any} args 
	 */
	emit(eventName, ...args)
	{
		this._events[eventName]?.forEach?.(callback => callback(...args));
		this._onceEvents[eventName]?.forEach?.(callback => callback(...args));
		delete this._onceEvents[eventName];
	}

	/**
	 * Adds the listener function to the end of the listeners array for the event named eventName
	 * 
	 * @param {string} eventName The event name
	 * @param {Function} listener The listener
	 */
	on(eventName, listener)
	{
		this._events[eventName] ??= [];
		this._events[eventName].push(listener);
	}

	/**
	 * Adds a one-time listener function for the event named eventName
	 * 
	 * @param {string} eventName The event name
	 * @param {Function} listener The listener
	 */
	once(eventName, listener)
	{
		this._onceEvents[eventName] ??= [];
		this._onceEvents[eventName].push(listener);
	}

	/**
	 * Removes the specified listener from the listener array for the event named eventName.
	 * 
	 * @param {string} eventName The event name
	 * @param {Function} listener The listener to remove or not
	 */
	off(eventName, listener)
	{
		let index;

		if (arguments.length >= 2)
		{
			index = this._events[eventName]?.findIndex?.(func => func.toString() == listener.toString());
			if (index >= 0)
				this._events[eventName].splice(index, 1);
			if (!this._events[eventName])
				delete this._events[eventName];
		}
		else
			delete this._events[eventName];
	}
}