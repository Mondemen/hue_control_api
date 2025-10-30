import Bridge from "../api_old/Bridge";
import ExtError from "./error";
import EventEmitter from "./EventEmitter";
import MDNS from "./MDNS";
import Request, { HTTPResponse } from "./Request";
import { createHash } from "crypto";

export interface HueBridgeInfo
{
	ip: string, /** Bridge IP */
	id: string, /** Bridge ID */
	name?: string, /** Bridge name */
	software_version?: string, /** Software version of the bridge */
}

export interface HueBridgeRemoteToken
{
	access_token: string,
	refresh_token: string;
	expires_at: Date;
	token_type: string
}

export interface HueBridgeRemoteInfo extends HueBridgeRemoteToken
{
	clientID: string,
	clientSecret: string
}

function randomString(length: number)
{
    let result = "";
    let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < length; i++)
    	result += chars.charAt(Math.floor(Math.random() * chars.length));
	return (result);
}

export default class Connector extends EventEmitter
{
	private _request: typeof Request;
	private _mdns: typeof MDNS;
	private _list: Record<string, HueBridgeInfo> = {};
	private _localLoaded = false;
	private _mdnsBrowser: MDNS;
	private _isBrowsing = false;
	private _gateway =
	{
		hue: {} as Record<string, Bridge>
	}
	private _remoteInfo?: HueBridgeRemoteInfo;
	private _authCallback?: (endpoint: {authorizationEndpoint: string, tokenEndpoint: string}, clientID: string, state: string) => Promise<{code: string, codeVerifier: string}>


	constructor(remoteInfo?: HueBridgeRemoteInfo, options: {request?: typeof Request, mdns?: typeof MDNS} = {})
	{
		super();
		this._request = options?.request ?? Request;
		this._mdns = options?.mdns ?? MDNS;
		if (!this._request)
			throw new ExtError("No requestor provided");
		if (!this._mdns)
			throw new ExtError("No mdns provided");
		this._remoteInfo = remoteInfo;
	}

	mdnsBrowse()
	{
		this._mdnsBrowser = new this._mdns("hue");
		this._mdnsBrowser.on("ready", () => this._mdnsBrowser.start());
		this._mdnsBrowser.on("resolved", async (endpoint: { addresses: string | any[]; txt: { bridgeid: string; }; host: any; fullName: string; name: string; }) =>
		{
			let checkConfig: { swversion: string | undefined; bridgeid: string; };
			let bridge: Partial<HueBridgeInfo> = {};
			let getName = (name: string) => name?.split?.(/\s*[-.]\s*/)?.[0];

			if (Array.isArray(endpoint.addresses) && endpoint.addresses.length)
				bridge.ip = endpoint.addresses[0];
			if (endpoint?.txt?.bridgeid)
				bridge.id = endpoint.txt.bridgeid.toUpperCase();
			if (endpoint?.host)
				bridge.name = getName(endpoint.fullName) ?? getName(endpoint.name);
			checkConfig = (await new this._request(`https://${bridge.ip}/api/0/config`).setStrictSSL(false).execute()).data;
			bridge.software_version = checkConfig.swversion;
			if (bridge.id && checkConfig?.bridgeid === bridge.id && !this._list[bridge.id])
			{
				this._list[bridge.id] = bridge as HueBridgeInfo;
				this.emit("hue_bridge_infos", this._list[bridge.id]);
			}
		});
	}

	async discoveryEndpointBrowse()
	{
		let res = (await new this._request(`https://discovery.meethue.com/`).execute()).data;
		let checkConfig: { bridgeid: any; };

		if (Array.isArray(res))
		{
			res.forEach(async endpoint =>
			{
				let bridge: Partial<HueBridgeInfo> = {};

				if (endpoint?.internalipaddress)
					bridge.ip = endpoint.internalipaddress;
				if (endpoint?.id)
					bridge.id = endpoint.id.toUpperCase();
				if (endpoint?.name)
					bridge.name = endpoint.name;
				checkConfig = (await new this._request(`https://${bridge.ip}/api/0/config`).setStrictSSL(false).execute()).data;
				if (bridge.id && checkConfig?.bridgeid === endpoint.id && !this._list[bridge.id])
				{
					this._list[bridge.id] = bridge as HueBridgeInfo;
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

	/**
	 * Register new application in Hue bridge
	 */
	async registerHueBridgeApp(bridge: HueBridgeInfo, appName: string, timeout: number = 120): Promise<HueBridgeInfo & {appName: string; appKey: string; clientKey: string}>
	{
		let checkConfig: { bridgeid: string; };

		if (!bridge?.ip)
			throw new ExtError("Missing bridge IP");
		if (!bridge?.id)
			throw new ExtError("Missing bridge ID");
		if (!appName)
			throw new ExtError("Missing application name");
		checkConfig = (await new this._request(`https://${bridge.ip}/api/0/config`).setStrictSSL(false).execute()).data;
		if (checkConfig?.bridgeid !== bridge.id)
			throw new ExtError("Targeted bridge does not have an ID corresponding to the one provided in parameter");
		return (new Promise((resolve, reject) =>
		{
			let found = false, cancel = false;
			let register = async () =>
			{
				let result = await new this._request(`https://${bridge.ip}/api`)
				.post()
				.setStrictSSL(false)
				.setBody({devicetype: `Hue Control#${appName}`, generateclientkey: true})
				.execute();

				if (Array.isArray(result.data) && result.data[0])
				{
					if (result.data[0].error && !cancel)
						setTimeout(register, 500);
					else if (result.data[0].success && !cancel)
					{
						found = true;
						resolve({...bridge, appName, appKey: result.data[0].success.username, clientKey: result.data[0].success.clientkey});
					}
				}
			}
			register();
			setTimeout(() =>
			{
				if (!found)
				{
					cancel = true;
					reject(new ExtError("Link button not pressed"));
				}
			}, timeout * 1000);
		}))
	}

	/**
	 * Gets bridge by ID
	 */
	getHueBridge(id: string): Bridge
	{return (this._gateway.hue[id])}

	/**
	 * Load bridge from their login info and return it
	 */
	async loadHueBridge(id: string, appKey: string, remoteAccess: HueBridgeRemoteToken | undefined | null, connect: boolean = true): Promise<Bridge | undefined>
	{
		let loaded = false;

		id = id.toUpperCase?.();
		return (new Promise<Bridge | undefined>((resolve, reject) =>
		{
			try
			{
				if (this._gateway.hue[id])
					return (resolve(this._gateway.hue[id]))
				if (!this._isBrowsing && !this._localLoaded)
					this.discover();
				if (this._isBrowsing)
				{
					this.once("hue_bridge_infos", async (gateway: { id: string; ip: string; }) =>
					{
						if (gateway.id?.toUpperCase() === id)
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
							resolve(undefined);
						else
						{
							if (this._gateway.hue[id])
								return (resolve(this._gateway.hue[id]))
							this._gateway.hue[id] = new Bridge("api.meethue.com", appKey, this._remoteInfo, this);
							resolve(this._gateway.hue[id]);
							if (connect)
								await this._gateway.hue[id].connect();
							this.emit("hue_bridge", this._gateway.hue[id]);
						}
					});
				}
				else
					resolve(undefined);
			}
			catch (error)
			{reject(error)}
		}));
	}

	registerAuthorizationCallback(callback: ((endpoint: { authorizationEndpoint: string; tokenEndpoint: string; }, clientID: string, state: string) => Promise<{ code: string; codeVerifier: string; }>) | undefined)
	{this._authCallback = callback}

	async getToken(bridgeID: string, appKey: string, authData?: Awaited<ReturnType<Connector["_authCallback"] & {}>>)
	{
		let req: Request;
		let state = randomString(30);
		let beforeTokenData: HTTPResponse;
		let baseURL = "https://api.meethue.com";
		let authorizePath = "/v2/oauth2/authorize";
		let tokenPath = "/v2/oauth2/token";
		let realm: string | undefined, nonce: string | undefined, hash1: any, hash2: any, digestCode: any;
		let tokenData: HTTPResponse<any>, bridgeData: HTTPResponse<any>;

		if (!this._remoteInfo)
			throw new ExtError("Missing remote info");

		// Authorize
		if (!authData)
		{
			if (!this._authCallback)
				throw new ExtError("Missing the authorization callback, use registerAuthorizationCallback()");
			authData = await this._authCallback(
			{
				authorizationEndpoint: `${baseURL}${authorizePath}`,
				tokenEndpoint: `${baseURL}${tokenPath}`
			}, this._remoteInfo.clientID, state);
		}
		if (!authData?.code)
			throw new ExtError("Missing the authorization code obtained from the remote portal");

		// Get NONCE
		req = new this._request(`${baseURL}${tokenPath}`).post();
		req.setHeader("Content-Type", "application/x-www-form-urlencoded");
		req.setParam("code", authData.code);
		req.setParam("grant_type", "authorization_code");
		if (authData.codeVerifier)
			req.setParam("code_verifier", authData.codeVerifier);
		beforeTokenData = await req.execute();
		if (!beforeTokenData?.headers?.["www-authenticate"])
			throw new ExtError("Missing realm and nonce code in response");
		realm = /realm="(.*?)"/.exec(beforeTokenData.headers["www-authenticate"])?.[1];
		nonce = /nonce="(.*?)"/.exec(beforeTokenData.headers["www-authenticate"])?.[1];
		if (!realm)
			throw new ExtError("Missing realm in response");
		if (!nonce)
			throw new ExtError("Missing nonce in response");

		// Get Token
		hash1 = createHash('md5').update(`${this._remoteInfo.clientID}:${realm}:${this._remoteInfo.clientSecret}`).digest("hex");
		hash2 = createHash('md5').update(`${beforeTokenData.method}:${tokenPath}`).digest("hex");
		digestCode = createHash('md5').update(`${hash1}:${nonce}:${hash2}`).digest("hex");
		req = new this._request(`${baseURL}${tokenPath}`).post();
		req.setHeader("Content-Type", "application/x-www-form-urlencoded");
		req.setHeader("Authorization", `Digest username="${this._remoteInfo.clientID}", realm="${realm}", nonce="${nonce}", uri="${tokenPath}", response="${digestCode}"`);
		req.setParam("grant_type", "authorization_code");
		req.setParam("code", authData.code);
		if (authData.codeVerifier)
			req.setParam("code_verifier", authData.codeVerifier);
		tokenData = await req.execute();
		// console.log("TOKEN", tokenData.statusCode, tokenData.statusMessage, tokenData.data);

		// Get bridge
		req = new this._request(`${baseURL}/route/clip/v2/resource/bridge`).get();
		req.setHeader("hue-application-key", appKey);
		req.setHeader("Authorization", `Bearer ${tokenData.data.access_token}`);
		bridgeData = await req.execute();
		if (bridgeData.statusCode !== 200)
			throw new ExtError(10);
		if (bridgeData.data.data[0]?.bridge_id?.toUpperCase() !== bridgeID)
			throw new ExtError(11);
		return ({
			access_token: tokenData.data.access_token,
			refresh_token: tokenData.data.refresh_token,
			expires_at: new Date(Date.now() + (tokenData.data.expires_in * 1000)),
			token_type: tokenData.data.token_type
		});
	}

	async getRefreshToken(remoteAccess: { refresh_token: any; })
	{
		let req: Request;
		let beforeTokenData: HTTPResponse, tokenData: HTTPResponse;
		let tokenPath = "/v2/oauth2/token";
		let realm: string | undefined, nonce: string | undefined, hash1: any, hash2: any, digestCode: any;

		if (!this._remoteInfo)
			throw new ExtError("Missing remote info");

		// Get NONCE
		req = new this._request(`https://api.meethue.com${tokenPath}`).post();
		req.setHeader("Content-Type", "application/x-www-form-urlencoded");
		req.setParam("grant_type", "authorization_code");
		beforeTokenData = await req.execute();
		if (!beforeTokenData.headers["www-authenticate"])
			throw new ExtError("Missing realm and nonce code in response");
		realm = /realm="(.*?)"/.exec(beforeTokenData.headers["www-authenticate"])?.[1];
		nonce = /nonce="(.*?)"/.exec(beforeTokenData.headers["www-authenticate"])?.[1];
		if (!realm)
			throw new ExtError("Missing realm in response");
		if (!nonce)
			throw new ExtError("Missing nonce in response");

		// Get Refresh Token
		hash1 = createHash('md5').update(`${this._remoteInfo.clientID}:${realm}:${this._remoteInfo.clientSecret}`).digest("hex");
		hash2 = createHash('md5').update(`${beforeTokenData.method}:${tokenPath}`).digest("hex");
		digestCode = createHash('md5').update(`${hash1}:${nonce}:${hash2}`).digest("hex");
		req = new this._request(`https://api.meethue.com${tokenPath}`).post();
		req.setHeader("Content-Type", "application/x-www-form-urlencoded");
		req.setHeader("Authorization", `Digest username="${this._remoteInfo.clientID}", realm="${realm}", nonce="${nonce}", uri="${tokenPath}", response="${digestCode}"`);
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