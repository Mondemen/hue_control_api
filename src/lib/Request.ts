import { ClientRequest, IncomingMessage } from "http";
import https, { RequestOptions } from "https";
import { URL } from "url";
import EventListener from "./EventEmitter";

export type HTTPResponse<D = any> = IncomingMessage &
{
	method?: string, /** The request method. */
	data: D /** The result of the request. */
}

export default class Request extends EventListener
{
	static State =
	{
		CONNECTING: "CONNECTING",
		OPEN: "OPEN",
		CLOSED: "CLOSED"
	}

	private _url: string;
	private _client: typeof https;
	private _options: RequestOptions = {};
	private _params = {};
	private _body: any;
	private _event: ClientRequest;
	private _state: typeof Request.State[keyof typeof Request.State];
	private _eventResponse: IncomingMessage;

	constructor(url: string)
	{
		let newURL = new URL(url);

		super();
		this._url = url;
		this._client = https;
		this._options.protocol = newURL.protocol;
		this._options.hostname = newURL.hostname;
		this._options.port = newURL.port;
		this._options.path = newURL.pathname;
		this.get();
		this.setHeader("Accept", "application/json");
	}

	get(): Request
	{return (this.method("GET"))}

	post(): Request
	{return (this.method("POST"))}

	put(): Request
	{return (this.method("PUT"))}

	delete(): Request
	{return (this.method("delete"))}

	method(method)
	{
		this._options.method = method;
		return (this)
	}

	setStrictSSL(strict = false)
	{
		this._options.agent = new this._client.Agent({rejectUnauthorized: strict});
		return (this);
	}

	setParam(key, value)
	{
		if (arguments.length === 1)
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
		if (arguments.length === 1)
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

	execute<D = any>(): Promise<HTTPResponse<D>>
	{
		return (new Promise((resolve, reject) =>
		{
			let req: ClientRequest;
			let header = {...this._options.headers};

			this._options.headers ??= {};
			header = Object.entries(header).reduce((result, [key, value]) => {result[key.toLowerCase()] = value; return (result)}, {});
			if (Object.keys(this._params).length)
			{
				if (header["content-type"]?.toString()?.toLowerCase?.() === "application/x-www-form-urlencoded")
				{
					this._body = Object.entries(this._params).map(param => param.map((value: any) => encodeURIComponent(value)).join("=")).join("&");
					this._options.headers["Content-Length"] = JSON.stringify(this._body.length);
				}
				else
					this._url += "?" + Object.entries(this._params).map(param => param.join("=")).join("&");
			}
			if (this._body && typeof this._body !== "string")
			{
				this._body = JSON.stringify(this._body);
				this._options.headers["Content-Type"] = "application/json";
				this._options.headers["Content-Length"] = JSON.stringify(this._body.length);
			}
			if (Object.keys(this._params).length)
				this._options.path += "?" + Object.entries(this._params).map(param => param.join("=")).join("&");
			req = this._client.request(this._options, res =>
			{
				let result: any = "";

				res.setEncoding("utf8");
				res.on("data", (chunk) => result += chunk);
				res.on("end", () =>
				{
					res.headers = Object.entries(res.headers).reduce((result, [key, value]) => {result[key.toLowerCase()] = value; return (result)}, {});
					if (res.headers?.["content-type"]?.toLowerCase?.()?.includes("application/json"))
						result = JSON.parse(result);
					resolve({...res, method: req.method, data: result} as HTTPResponse<D>);
				});
				res.on("error", error => reject(error));
			});
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
		this._event = this._client.request(this._options, res =>
		{
			this._eventResponse = res;
			this._eventResponse.setEncoding("utf8");
			this._eventResponse.on("end", () => console.log("END"))
			this._eventResponse.on("data", chunk =>
			{
				let result: Record<string, string> = {};

				this._state = Request.State.OPEN;
				chunk = chunk.toString().split("\n");
				chunk.forEach((data: string) =>
				{
					const [key, value] = data.split(/:(.+)/, 2);

					result[key] = value;
				})
				if (result.data)
					this.emit("data", result.data);
			});
			this._eventResponse.on("error", error =>
			{
				this._state = Request.State.CLOSED;
				console.log(error);
			});
		});
		if (this._body)
			this._event.write(JSON.stringify(this._body));
		this._event.end();
		this._event.on("connect", () =>
		{
			this._state = Request.State.OPEN;
			console.log("CONNECTED");
		});
		return (this);
	}

	close()
	{
		this._event.removeAllListeners("connect");
		this._eventResponse.removeAllListeners("end");
		this._eventResponse.removeAllListeners("data");
		this._eventResponse.removeAllListeners("error");
		this._state = Request.State.CLOSED;
		return (this);
	}

	getState(): typeof Request.State[keyof typeof Request.State]
	{return (this._state)}
}
