// import mdns from "mdns-js";
import Bonjour, { Browser } from "bonjour-service";
import EventListener from "./EventEmitter";

export default class MDNS extends EventListener
{
	private name: string;
	private protocol: "tcp" | "udp";
	private bonjour: Bonjour;
	private browser: Browser;

	constructor(name: string, protocol: "tcp" | "udp" = "tcp")
	{
		super();
		this.name = name;
		this.protocol = protocol;
		// this.browser = mdns.createBrowser(mdns[protocol](name));
		this.bonjour = new Bonjour();
		this.browser = this.bonjour.find({type: "http", name, protocol}, service => this.emit("resolved", service));
		// this.browser.on("ready", () => this.emit("ready"))
		// this.browser.on("update", data =>
		// {
		// 	data.host = data?.host?.replace?.(".local", "");
		// 	data.txt = data?.txt?.reduce?.((result, value) =>
		// 	{
		// 		let tmp = value.split("=");

		// 		result[tmp[0]] = tmp[1].toUpperCase();
		// 		return (result);
		// 	}, {});
		// 	this.emit("resolved", data);
		// });
	}

	start()
	{
		this.browser.start();
		this.emit("start");
	}

	stop()
	{
		this.browser.stop();
		this.emit("stop");
	}
}
