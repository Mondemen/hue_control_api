import mdns from 'mdns-js';
import EventListener from "./EventEmitter.js";

export default class MDNS extends EventListener
{
	_name;
	_protocol;
	_browser;
	_events = {};

	constructor(name, protocol = "tcp")
	{
		super();
		this._name = name;
		this._protocol = protocol;
		this._browser = mdns.createBrowser(mdns[protocol](name));
		this._browser.on("ready", () => this.emit("ready"))
		this._browser.on('update', data =>
		{
			data.host = data?.host?.replace?.(".local", "");
			data.txt = data?.txt?.reduce?.((result, value) =>
			{
				let tmp = value.split("=");

				result[tmp[0]] = tmp[1].toUpperCase();
				return (result);
			}, {});
			this.emit("resolved", data);
		});
	}

	start()
	{
		this._browser.discover();
		this.emit("start");
	}

	stop()
	{
		this._browser.stop();
		this.emit("stop");
	}
}
