import Animation from "./src/api/Animated";
import Registry from "./src/api/Registry";
import Color from "./src/lib/Color";

// [
// 	{
// 		"success": {
// 			"username": "ukxi2MZmzGthPt1u1dUk7uUJb2OiBcgqiBh9VwSB",
// 			"clientkey": "573FB25B6879CF8DAEC2C7CD0336FF62"
// 		}
// 	}
// ]

async function main()
{
	const registry = new Registry("192.168.0.202", {bridgeID: "ecb5fafffe1e0ce3", appKey: "ukxi2MZmzGthPt1u1dUk7uUJb2OiBcgqiBh9VwSB", clientKey: "573FB25B6879CF8DAEC2C7CD0336FF62"});
	// const registry = new Registry("192.168.0.175", {bridgeID: "ecb5fafffe89cf8f", appKey: "8u03ik7CohLa3mjB1bJGFbX4-HqGhuXmKtaqnWDC", clientKey: "C992702AFE24BC81AA43860052C2E542"});

	registry.on("error", errors =>
	{
		console.log("Errors:", errors);
	})
	await registry.connect();

	// }
	// for (let t = 0; t <= 1; t = (t * 100000 + 0.05 * 100000) / 100000)
	// 	console.log(curve.get(t).x.toFixed(4), "\t", curve.get(t).y.toFixed(4));

	// console.log();
	// for (let t = 0; t <= 1; t = (t * 100000 + 0.05 * 100000) / 100000)
	// 	console.log(t);
	// for (let t = 0; t <= 1; t = (t * 100000 + 0.05 * 100000) / 100000)
	// 	console.log(t, "\t", curve2.get(t).x);

	// // const noise = new ValueNoise();

	// // for (let x = 0; x < 1000; x++)
	// // {
	// // 	console.log(noise.gen(x / 128) * 100)
	// // }
	// setInterval(() =>
	// {
	// 	console.log((noise.gen(i / 64) + 1) / 2 * 100);
	// 	i++;
	// }, 1000 / 60);
	// registry.startEntertainment();
	// return;
	// console.log(registry.getBridges());
	registry.getBridges().forEach(async bridge =>
	{
		// const m = new Map<string, number>();

		// console.log(inspect(bridge.getRooms().find(room => room.getName() === "Divers")?.getScenes().map(scene => ({name: scene.getName(), colors: scene.getPalette().getColors(), effects: scene.getPalette().getEffects()})), false, null, true));
		// return;
		// m.set("toto", 42);
		// m.set("tutu", 69);
		// m.set("merde", 666);
		// console.log("FIND", m.mapArray((value, key) => ({key, value})))
		// console.log(bridge.getDevices("accessory"));
		// console.time("test");
		// console.log(bridge.getEntertainmentConfigurations());
		// console.timeEnd("test");

		// Animated.sequence(
		// [
		// 	{duration: 1000, start() {}},
		// 	{duration: 1000, start() {}}
		// ]).start(40);
		// Animated.sequence(
		// [
		// 	{duration: 1000, start() {}},
		// 	{duration: 1000, start() {}}
		// ]).start(122);
		// Animated.timing(0,
		// {
		// 	brightness: [10, 40, 75]
		// }, 1200);
		// Animated.timing(10,
		// {
		// 	brightness: [10, 40, 75]
		// }, 1200);

		// const rand = new NewMath(2);
		// let current = rand.random();
		// let op: number;

		// for (let i = 0; i < 300; i++)
		// {
		// 	op = NewMath.map(rand.random(), 0, 1, 0, 0.1);
		// 	if (rand.random() < 0.5)
		// 		current = (current - op < 0) ? (current + op) : (current - op);
		// 	else
		// 		current = (current - op > 1) ? (current - op) : (current + op);
		// 	console.log(NewMath.map(current, 0, 1, 0, 100));
		// }

		// function getValue(i: number, list: Bezier[])
		// {

		// }
		// for (let t = 0; t <= 1; t = (t * 100000 + 0.05 * 100000) / 100000)
		// 	console.log(t, curve1.get(t).x);
		// for (let t = 0; t <= 1; t = (t * 100000 + 0.05 * 100000) / 100000)
		// 	console.log(t, curve2.get(t).x);

		// console.log(1000 % 1000);
		// console.log(NewMath.random());
		// return;

		// const light = bridge.getDevices("light").find(light => light.getName() === "Exposition Harry Potter");

		// console.log(light);

		// light?.on("brightness", brightness => console.log("LIGHT BRIGHTNESS", brightness));

		// let direction = 2;
		// setInterval(async () =>
		// {
		// 	if (i >= 0 && i <= 100)
		// 		await light?.setState(true).setBrightness(i).setDuration(200).update();
		// 	else
		// 		direction = 0 - direction;
		// 	i += direction;
		// }, 100);




		// let amplitude = 100;
		// let frequency = 1000 / 60 / (Math.PI / 2);

		// for(let x = 0; x < 120; x++)
		// {
		// 	let y = Math.round(NewMath.map(Math.sin(x / frequency), -1, 1, 0, 1) * 100);
		// 	console.log(x, y);
		// }

		// return;
		// const entertainment = bridge.getEntertainmentConfigurations().find(config => config.getName() === "Test");
		// const entertainment = bridge.getEntertainmentConfigurations().find(config => config.getName() === "Espace Musique");
		const entertainment = bridge.getEntertainmentConfigurations().find(config => config.getName() === "Animation");
		const light = bridge.getDevices("light").find(light => light.getName() === "Exposition Harry Potter");
		// const light2 = bridge.getDevices("light").find(light => light.getName() === "Bar");
		// const light3 = bridge.getDevices("light").find(light => light.getName() === "Cuisine");

		// console.log(entertainment);

		if (!entertainment)
			return;

		// async function sequence(light: Light)
		// {
		// 	await light.setState(true).setColor("blue").setBrightness(0).update();
		// 	// setTimeout(1000);
		// 	await light.setColor("red").setBrightness(100).setDuration(5000).update();
		// 	console.log('await light.setColor("red").setBrightness(100).setDuration(5000).update()');
		// 	setTimeout(2500);
		// 	await light.setBrightness(10).setDuration(5000).update();
		// 	console.log('await light.setBrightness(0).setDuration(5000).update()');
		// 	setTimeout(2500);
		// 	await light.setColor("blue").setBrightness(0).setDuration(2500).update();
		// 	console.log('await light.setColor("blue").setDuration(2500).update()');
		// }
		// if (light)
		// 	sequence(light);
		// console.log(light);
		// if (light)
		// 	entertainment.addCustomLight(light);
		// if (light2)
		// 	entertainment.addCustomLight(light2, 100);
		// if (light3)
		// 	entertainment.addCustomLight(light3, 100);

		// return;
		const color0 = new Color("lightskyblue");
		// const color1 = new Color("darkorange");
		// // const color1 = new Color("red");
		// const color2 = new Color("blue");
		// const color3 = new Color("green");
		// const color4 = new Color("orange");


		light?.startPalette(
		[
			light => light.setColor("#3E94FF").setBrightness(30),
			light => light.setColor("#3DD1FF"),
			light => light.setColor("#9EF6FF"),
			light => light.setColor("#FFBEAB"),
			light => light.setColor("#FF9C6D")
		], 5000);
		// console.log("COLOR1", color1);
		// const context: Context =
		// {
		// 	framesPerSecond: 50,
		// 	lights: entertainment.getChannels().reduce((list, channel) =>
		// 	{
		// 		const light = channel.getService().getLight();

		// 		if (light)
		// 			list[light.getID()] = {};
		// 		return (list);
		// 	}, {} as Context["lights"])
		// };

		const lights = entertainment.getLightStreams();

		lights.filter(light => light.getName().includes("Enceinte") || light.getName() === "Bureau").forEach(light =>
		{
			light.sequence(
			[
				// {brightness: 0, duration: 300},
				// {
				// 	color: "#4045FF",
				// 	brightness: Animation.Modifier.brightness({brightness: [0, 55], transitionFunction: "ease"}),
				// 	duration: 800
				// },
				{
					color: Animation.Modifier.colorPalette(
					{
						color: ["#4045FF", "#5E4EFF", "#892BFF", "#FF7FF6", "#FF7145"],
						transition: "2s"
					}),
					brightness: Animation.Modifier.flicker({min: 45, max: 60}),
					duration: {min: "10s", max: "20s"},
				},
				{
					color: color0,
					brightness: Animation.Modifier.lightning(),
					loop: {min: 2, max: 3},
					duration: {min: 400, max: 700}
				},
				// {brightness: 0, duration: 300},
				// {
				// 	color: "#FF2C07",
				// 	brightness: Animation.Modifier.brightness({brightness: [0, 55], transitionFunction: "ease"}),
				// 	duration: 800
				// },
				{
					color: Animation.Modifier.colorPalette(
					{
						color: ["#FF2C07", "#FF7320", "#FF9835", "#9B57FF", "#720CFF"],
						transition: "1s 500ms"
					}),
					brightness: Animation.Modifier.flicker({min: 45, max: 60}),
					duration: {min: "5s", max: "10s"},
				},
				{
					color: color0,
					brightness: Animation.Modifier.lightning(),
					loop: {min: 2, max: 4},
					duration: {min: 400, max: 700}
				},
			]);
		});
		lights.filter(light => light.getName().includes("Table")).forEach(light =>
		{
			light.sequence([
				{
					color: ["#f85f1c", "#fe9a00", "#f85f1c"],
					brightness: Animation.Modifier.flicker({min: 60, max: 80}),
					duration: {min: "10s", max: "20s"},
					loop: 5
				},
			])
		})
		lights.filter(light => light.getName().includes("Meuble")).forEach(light =>
		{
			light.sequence([
				{brightness: 0, duration: 300},
				{
					color: "#ff4c02",
					brightness: Animation.Modifier.brightness({brightness: [0, 65], transitionFunction: "ease"}),
					duration: "1s"
				},
				{
					color: ["#ff4c02", "#ffa600", "#ff4c02"],
					brightness: Animation.Modifier.wave({min: 50, max: 80}),
					duration: {min: "7s", max: "15s"},
					loop: 3
				},
				{
					color: color0,
					brightness: Animation.Modifier.lightning(),
					loop: {min: 2, max: 4},
					duration: {min: 400, max: 700}
				},
			])
		})
		lights.filter(light => light.getName().includes("Salle") || light.getName().includes("Entrée")).forEach(light =>
		{
			light.sequence([
				{
					color: Animation.Modifier.colorPalette({color: ["#fe9a00", "#ffa500"], transition: "3s"}),
					brightness: Animation.Modifier.flicker({min: 80}),
					duration: "6s",
					loop: 3
				}
			])
		})
		lights.filter(light => light.getName().includes("Télé")).forEach(light =>
		{
			light.sequence([
				{
					color: Animation.Modifier.colorPalette({color: ["#fe9a00", "#ffa500"], transition: "3s"}),
					brightness: Animation.Modifier.flicker({min: 80}),
					duration: {min: "6s", max: "10s"},
				},
				{
					color: color0,
					brightness: Animation.Modifier.lightning(),
					loop: {min: 2, max: 3},
					duration: {min: 400, max: 700}
				},
			])
		})

		await entertainment?.start();
		// lights.forEach(light =>
		// {
		// 	let brightness = (noise.gen((frame + light.getChannelID() * 50) / 64) + 1) / 2 * 100;

		// 	// console.log(brightness);
		// 	brightness = Math.max(brightness, 0);
		// 	light.setColor("darkorange").setBrightness(brightness);
		// 	// lights.find(light => light.getName() === "Table basse droite")?.setColor("darkorange").setBrightness(brightness);

		// })

		// console.log((noise.gen(frame / 64) + 1) / 2 * 100);
		// console.log(frame, lights);

		(["SIGINT", "SIGUSR1", "SIGUSR2"] as NodeJS.Signals[]).forEach(signal =>
		{
			process.on(signal, async function()
			{
				await entertainment?.stop();
				process.exit();
			});
		})
		// const light = bridge.getDevices("light").find(light => light.getName() === "Table basse gauche");

		// console.log(light, light?.getEntertainment()?.getConfigurations());
		return;
		// const room = bridge.getRooms().find(room => room.getName() === "Séjour");

		// console.log("ROOM", room);
		// // console.log("SCENE", room?.getScenes(), room?.getScenes().length);
		// // console.log("LIGHT", room?.getLights()[0]);
		// if (room)
		// {
		// 	const scene = room.getScenes().find(scene => scene.getName() === "Test scene API");

		// 	if (scene)
		// 	{
		// 		// console.log("SCENE", scene);
		// 		scene.setName("Test scene API");
		// 		room.getLights().forEach(light =>
		// 		{
		// 			const action = scene.getAction(light);

		// 			action.setState(true);
		// 			action.setColor("blue");
		// 			action.setBrightness(20);
		// 			action.getGradient()?.addColor("blue");
		// 			action.getGradient()?.addColor("red");
		// 			action.getGradient()?.addColor("green");
		// 		});
		// 		scene.getPalette().clearColors();
		// 		scene.getPalette().addColor("blue");
		// 		scene.getPalette().addColor("red");
		// 		scene.getPalette().addColor("green");
		// 	// await scene.update();
		// 	}
		// 	// scene.getAction(room.getLights()[0]).setState(true);
		// 	// room.getLights().at(0)
		// }
		// console.log(bridge.getRooms().find(room => room.getName() === "Séjour")?.newScene())
		// console.log(registry.resources.unknown);
		// registry.resources.light.get("0-à-à-à-à")?.getOwner().getEntertainment()?.getID()
		// console.log(bridge.getName());
		// console.log(bridge);
		// bridge.setName("Toulouse").update();

		// setTimeout(() =>
		// {
		// 	console.log(bridge);
		// }, 5000);
		// bridge.setArchetype("candle_bulb").update();
	})
	// console.log(registry.resources.device);

	// console.log("LIGHTS", inspect((Array.from(registry.resources.device?.values() ?? []) as Device[]).filter(device => device instanceof Light), false, null, true));
	// console.log("COUNT", (Array.from(registry.resources.device?.values() ?? []) as Device[]).filter(device => device instanceof Light).length);
	// console.log("COUNT LIGHTSERVICE", (Array.from(registry.resources.light?.values() ?? []) as LightService[]).filter(device => device instanceof LightService).length);
	const tv = registry.resources.light.find(light => light.getName() === "Télévision");

	// console.log(tv);
	if (tv)
	{
		// await tv.identify();
		// await tv.setColor("black").update();
		// await tv.setColorTemperatureDelta(500).update();
	}


	// const connector = new Connector();
	// const bridge = new Bridge("192.168.0.202", "ukxi2MZmzGthPt1u1dUk7uUJb2OiBcgqiBh9VwSB", null, connector);

	// console.log(bridge);
	// await bridge.connect();
	// console.log(bridge);

	// // Print all rooms/zones with their devices and scenes in the console
	// bridge.describe();
	// bridge.
	// console.log(Object.keys(bridge._resources).filter(key => key.includes("room")));
}

try
{
	main();
}
catch (error)
{
	console.log(error);
}