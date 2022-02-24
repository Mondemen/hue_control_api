import crypto from "crypto";
import http from "http";
import https from "https";
import client from "urllib";
import readline from "readline";

const rl = readline.createInterface(
{
	input: process.stdin,
	output: process.stdout
});

const ip = "192.168.1.4";
const port = 1926;
const deviceData =
{
	device_name: "heliotrope",
	device_os: "Android",
	app_id: "hue_control",
	app_name: "HueControl",
	type : "native",
	id: "abcd1234"
}

function askPinCode()
{
	return (new Promise((resolve, reject) =>
	{
		rl.question('Pin Code? ', pinCode => resolve(parseInt(pinCode)));
	}))
}

function getHMACKey(secret, message)
{
	let hmac = crypto.createHmac("sha256", secret);

	hmac.update(message);
	return (hmac.digest('hex'));
}

async function main()
{
	let response = await client.request(`https://${ip}:${port}/6/pair/request`,
	{
		method: 'POST',
		rejectUnauthorized: false,
		headers:
		{
			"content-type": "application/json"
		},
		data:
		{
			scope: 
			[
				"read",
				"write",
				"control"
			],
			device: deviceData
		}
	});
	let data = JSON.parse(response.res.data.toString());
	let pin = await askPinCode();
	console.log(data);


	let grant = await client.request(`https://${ip}:${port}/6/pair/grant`,
	{
		method: 'POST',
		rejectUnauthorized: false,
		digestAuth: `${deviceData.id}:${data.auth_key}`,
		headers:
		{
			"content-type": "application/json"
		},
		data:
		{
			auth:
			{
				auth_AppId : "1",
				pin,
				auth_timestamp: data.timestamp,
				auth_signature: getHMACKey("secret_key", `${data.timestamp}${pin}`)
			},
			device: deviceData
		}
	});
	console.log(JSON.parse(grant.res.data.toString()));
	// console.log(getHMACKey("secret_key", `${timestamp}${pin}`));
	// console.log(getHMACKey("secret_key", `${5499}${4727}`));
}

main();
