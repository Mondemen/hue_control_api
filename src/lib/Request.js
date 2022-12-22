import http, {IncomingMessage} from "http";
import https from "https";
import {URL} from "url";
import EventListener from "./EventEmitter.js";

export default class Request extends EventListener
{
	/**
	 * State of connection
	 *
	 * @enum {string}
	 * @readonly
	 */
	static State =
	{
		CONNECTING: "CONNECTING",
		OPEN: "OPEN",
		CLOSED: "CLOSED"
	}

	/** @private */
	_url;
	/** @private */
	_client;
	/** @private */
	_options = {};
	/** @private */
	_params = {};
	/** @private */
	_body;
	/** @private */
	_events;

	/**
	 *
	 * @param {string} url URL of the request
	 */
	constructor(url)
	{
		super();
		this._url = url;
		url = new URL(url);
		this._client = (url.protocol == "https:") ? https : http;
		this._options.protocol = url.protocol;
		this._options.hostname = url.hostname;
		this._options.port = url.port;
		this._options.path = url.pathname;
		this.get();
		this.setHeader("Accept", "application/json");
	}

	/**  @returns {Request} */
	get()
	{return (this.method("GET"))}

	/**  @returns {Request} */
	post()
	{return (this.method("POST"))}

	/**  @returns {Request} */
	put()
	{return (this.method("PUT"))}

	/**  @returns {Request} */
	delete()
	{return (this.method("delete"))}

	method(method)
	{
		this._options.method = method;
		return (this)
	}

	setStrictSSL(strict = false)
	{
		this._options.agent = this._client.Agent({rejectUnauthorized: strict});
		return (this);
	}

	setParam(key, value)
	{
		if (arguments.length == 1)
			this._params = key;
		else
		{
			this._params ??= {};
			this._params[key] = value;
		}
		return (this);
	}

	setHeader(key, value)
	{
		if (arguments.length == 1)
			this._options.headers = key;
		else
		{
			this._options.headers ??= {};
			this._options.headers[key] = value;
		}
		return (this);
	}

	setBody(body)
	{
		this._body = body;
		return (this);
	}

	/**
	 * @typedef HTTPResponse
	 * @type {object}
	 * @property {string} method The request method.
	 * @property {string} data The result of the request.
	 */
	/**
	 * Execute the request
	 *
	 * @returns {Promise<HTTPResponse & IncomingMessage>}
	 */
	execute()
	{
		return (new Promise(async (resolve, reject) =>
		{
			let req;
			let header = {...this._options.headers};

			header = Object.entries(header).reduce((result, [key, value]) => {result[key.toLowerCase()] = value; return (result)}, {});
			if (Object.keys(this._params).length)
			{
				if (header["content-type"]?.toLowerCase?.() == "application/x-www-form-urlencoded")
				{
					this._body = Object.entries(this._params).map(param => param.map(value => encodeURIComponent(value)).join("=")).join("&")
					this._options.headers["Content-Length"] = JSON.stringify(this._body.length);
				}
				else
					this._url += "?" + Object.entries(this._params).map(param => param.join("=")).join("&");
			}
			if (this._body && typeof this._body != "string")
			{
				this._body = JSON.stringify(this._body);
				this._options.headers["Content-Type"] = "application/json";
				this._options.headers["Content-Length"] = JSON.stringify(this._body.length);
			}
			if (Object.keys(this._params).length)
				this._options.path += "?" + Object.entries(this._params).map(param => param.join("=")).join("&");
			req = this._client.request(this._options, res =>
			{
				let result = "";

				res.setEncoding('utf8');
				res.on('data', (chunk) => result += chunk);
				res.on('end', () =>
				{
					res.headers = Object.entries(res.headers).reduce((result, [key, value]) => {result[key.toLowerCase()] = value; return (result)}, {});
					if (res.headers?.["content-type"]?.toLowerCase?.()?.includes("application/json"))
						result = JSON.parse(result);
					resolve({...res, headers: res.headers, method: req.method, data: result});
				});
				res.on('error', error => reject(error));
			});
			if (this._body && typeof this._body != "string")
			{
				this._body = JSON.stringify(this._body);
				this._headers["Content-Type"] = "application/json";
				this._headers["Content-Length"] = String(this._body.length);
			}
			if (this._body)
				req.write(this._body);
			req.end();
		}))
	}

	connect()
	{
		this.setHeader("Accept", "text/event-stream");
		if (Object.keys(this._params).length)
			this._options.path += "?" + Object.entries(this._params).map(param => param.join("=")).join("&");
		this._state = Request.State.CONNECTING;
		this._events = this._client.request(this._options, res =>
		{
			this._eventResponse = res;
			this._eventResponse.setEncoding('utf8');
			this._eventResponse.on("end", () => console.log("END"))
			this._eventResponse.on('data', chunk =>
			{
				let result = {};

				this._state = Request.State.OPEN;
				chunk = chunk.toString().split("\n");
				chunk.forEach(data =>
				{
					data = data.split(/:(.+)/, 2);
					result[data[0]] = data[1];
				})
				if (result.data)
					this.emit("data", result.data);
			});
			this._eventResponse.on('error', error =>
			{
				this._state = Request.State.CLOSED;
				console.log(error);
			});
		});
		if (this._body)
			this._events.write(JSON.stringify(this._body));
		this._events.end();
		this._events.on("connect", () =>
		{
			this._state = Request.State.OPEN;
			console.log("CONNECTED");
		});
		return (this);
	}

	close()
	{
		this._events.removeAllListeners("connect");
		this._eventResponse.removeAllListeners("end");
		this._eventResponse.removeAllListeners("data");
		this._eventResponse.removeAllListeners("error");
		this._state = Request.State.CLOSED;
		return (this);
	}

	/**
	 * @returns {Request.State}
	 */
	getState()
	{return (this._state)}
}
