import { Connector } from "./index.js";
import Request from "./lib/Request.js";
import MDNS from "./lib/MDNS.js";

async function main()
{
	let connector = new Connector(Request, MDNS);
	// let bridges;
	
	// connector.on("hue_bridge", bridge => console.log(bridge));
	console.time("GET BRIDGE");
	console.log(await connector.registerHueBridge({ip: "192.168.1.44", id: "ECB5FAFFFE89CF8F"}, "test"));
	// console.log("BRIDGE", await connector.loadHueBridge("ECB5FAFFFE89CF8F", "GWjE2g3D77x7bjqYAZ2wAL994NV9qorKF-6k1Wco"));
	// console.log("BRIDGE2", await connector.loadHueBridge("ECB5FAFFFE89CF8F", "GWjE2g3D77x7bjqYAZ2wAL994NV9qorKF-6k1Wco"));
	console.timeEnd("GET BRIDGE");
	// bridges = await connector.discover();
	// console.log("ALL BRIDGE", bridges);
	// connector.newRemoteConnection("3bNkjsuWgGUJ7GSAl3vZ1A2jxuewBGpP", "DfWlDqAehTt9JzoV")

}

main();