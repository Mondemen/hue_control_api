import EventEmitter from "events";
import http from "http";
import https from "https";
import {URL} from "url";

export default class Request extends EventEmitter
{
	_url;
	_client;
	_options = {};
	_params = {};
	_body;
	_events;

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

	get()
	{return (this.method("GET"))}

	post()
	{return (this.method("POST"))}

	put()
	{return (this.method("PUT"))}

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

	execute()
	{
		return (new Promise(async (resolve, reject) =>
		{
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
			if (Object.keys(this._params).length)
				this._options.path += "?" + Object.entries(this._params).map(param => param.join("=")).join("&");
			let req = this._client.request(this._options, res =>
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
				this._body = JSON.stringify(this._body);
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
		this._events = this._client.request(this._options, res =>
		{
			res.setEncoding('utf8');
			res.on('data', chunk =>
			{
				let result = {};

				chunk = chunk.toString().split("\n");
				chunk.forEach(data =>
				{
					data = data.split(/:(.+)/, 2);
					result[data[0]] = data[1];
				})
				if (result.data)
					this.emit("data", result.data);
			});
			res.on('error', error => console.log("ERROR"));
		});
		if (this._body)
			this._events.write(JSON.stringify(this._body));
		this._events.end();
		this._events.on("connect", () => console.log("CONNECTED"));
		return (this)
	}

	emit(event, ...args)
	{
		this._events[event]?.forEach?.(callback => callback(...args));
	}

	on(event, callback)
	{
		this._events[event] ??= [];
		this._events[event].push(callback);
		return (callback);
	}

	removeAllListeners(event)
	{
		delete this._events[event];
	}
}
