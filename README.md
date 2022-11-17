
# Hue Control API
[![npm](https://img.shields.io/npm/v/hue_control_api.svg)](https://www.npmjs.com/package/hue_control_api)

An API library for Node.js that interacts with the Philips Hue bridge to control lights, rooms/zones, scenes and various other features of the Hue bridge using the new V2 API (and some features from V1 quin' have not yet been put on the V2).

This library is currently in alpha, the majority of the essential features are already present and usable but the others such as the rule engine or the entertainment areas are not yet integrated. To see what features are available and which are coming soon, please see the Features section.

# Contents
* [Installation](#installation)
* [Concept](#concept)
* [Basic Usage](#basic-usage)
	* [Connect to Hue Bridge](#connect-to-hue-bridge)
		* [By discovering](#by-discovering)
		* [By IP](#by-ip)
		* [By bridge ID](#by-bridge-id)
		* [By remote](#by-remote)
			* [Using auth code](#using-auth-code)
			* [Using Hue auth portal](#using-hue-auth-portal)
* [Features](#features)
	* [Bridge](#bridge)
	* [Global Device (light/accessory)](#global-device-light-accessory)
		* [Light/Plug](#lightplug)
		* [Accessory](#accessory)
	* [Group (room/zone)](#group-roomzone)
	* [Scene](#scene)
	* [Automation](#automation)
	* [Entertainment](#entertainment)
	* [Matter](#matter)
	* [Homekit](#homekit)

# Installation

Node.js using npm:

    $ npm install hue_control_api

# Concept

The whole library works on the principle of resource and event, all objects are based on the class Resource and the resources send events when a light, room, button, ... is updated on the bridge.

When connecting to through the local network, it is therefore not necessary to do `light.getColor()` for example, using instead `light.on("color", color => console .log(color))`, you would immediately have the up-to-date values.

This system makes it possible to work in real time and to be able to react quickly (like updating a graphic interface for example).

# Basic usage

There are 4 possibilities of connection to a bridge, discovering all bridge available in local network, the direct connection to an IP, by its unique ID through the search for a bridge on the local network or thanks to the remote identifier.

## Connect to Hue bridge

### By discovering

```js
import {Connector} from  "hue_control_api";

const  connector  =  new  Connector();

connector.on("hue_bridge_infos", async  bridge  =>
{
	let  bridgeData;

	console.log("Wait linking...");
	bridgeData  =  await  connector.registerHueBridgeApp(bridge, "<APPLICATION_NAME>");
	console.log(`Bridge linked ! (ip: ${bridgeData.ip}, id: ${bridgeData.id}, appKey: ${bridgeData.appKey})`);
	bridge  =  await  connector.loadHueBridge(bridgeData.id, bridgeData.appKey);

	// Print all rooms/zones with their devices and scenes in the console
	bridge.describe();
})

await  connector.discover();
```
### By IP

```js
import {Connector, Bridge} from  "hue_control_api";

async function main()
{
	const  connector  =  new  Connector();
	const  bridge  =  new  Bridge("<BRIDGE_IP>", "<APPLICATION_KEY>", null, connector);

	await  bridge.connect();

	// Print all rooms/zones with their devices and scenes in the console
	bridge.describe();
}

main();
```
### By bridge ID

```js
import {Connector} from  "hue_control_api";

async  function  main()
{
	const  connector  =  new  Connector();
	const  bridge  =  await  connector.loadHueBridge("<BRIDGE_ID>", "<APPLICATION_KEY>");

	// Print all rooms/zones with their devices and scenes in the console
	bridge.describe();
}

main();
```
### By remote
#### Using auth code

```js
import {Connector} from  "hue_control_api";

async  function  main()
{
	const  connector  =  new  Connector({clientID: "<HUE_CLIENT_ID>", clientSecret: "<HUE_CLIENT_SECRET>"});
	const  bridgeID  =  "<BRIDGE_ID>";
	const  remoteAccess  =  await  connector.getToken(bridgeID, "<APPLICATION_KEY>", {code: "<AUTH_CODE>", codeVerifier: "<AUTH_CODE_VERFIFIER>"});
	const  bridge  =  await  connector.loadHueBridge(bridgeID, , "<APPLICATION_KEY>", remoteAccess);

	// Print all rooms/zones with their devices and scenes in the console
	bridge.describe();
}

main();
```
#### Using Hue auth portal

```js
import {Connector} from  "hue_control_api";

async  function  main()
{
	const  connector  =  new  Connector({clientID: "<HUE_CLIENT_ID>", clientSecret: "<HUE_CLIENT_SECRET>"});
	const  bridgeID  =  "<BRIDGE_ID>";
	let  remoteAccess;
	let  bridge;

	connector.registerAuthorizationCallback(async (endpoints, clientID, state) =>
	{
		/**
		 * Here, execute request to Hue auth portal
		 * The request should return code and code verifier to continue the authentication
		 */
		return ({code: "<AUTH_CODE>", codeVerifier: "<AUTH_CODE_VERFIFIER>"});
	});
	// The getToken method will execute the authorization callback
	remoteAccess  =  await  connector.getToken(bridgeID, "<APPLICATION_KEY>");
	bridge  =  await  connector.loadHueBridge(bridgeID, "<APPLICATION_KEY>", remoteAccess);

	// Print all rooms/zones with their devices and scenes in the console
	bridge.describe();
}

main();
```
# Features
Below thte list of features currently supported by this library

## Bridge
|  Feature                 | Local              | Remote             |
|--------------------------|--------------------|--------------------|
| Bridge discovery         | :heavy_check_mark: | :heavy_check_mark: |
| Device discovery         | :heavy_check_mark: | :heavy_check_mark: |
| Connect with link button | :heavy_check_mark: | :x:                |
| Search new light         | :x:                | :x:                |
| Search new accessory     | :x:                | :x:                |
| Event stream             | :heavy_check_mark: | :x:                |

## Global Device (light, accessory)
|  Feature         | Local              | Remote             |
|------------------|--------------------|--------------------|
| Delete           | :heavy_check_mark: | :heavy_check_mark: |
| Get ID           | :heavy_check_mark: | :heavy_check_mark: |
| Get V1 ID        | :heavy_check_mark: | :heavy_check_mark: |
| Get name         | :heavy_check_mark: | :heavy_check_mark: |
| Set name         | :heavy_check_mark: | :heavy_check_mark: |
| Get archtype     | :heavy_check_mark: | :heavy_check_mark: |
| Set archtype     | :heavy_check_mark: | :heavy_check_mark: |
| Get product data | :x:                | :x:                |
| Get service list | :heavy_check_mark: | :heavy_check_mark: |
| Get room         | :heavy_check_mark: | :heavy_check_mark: |
| Set room         | :x:                | :x:                |

### Light/Plug
|  Feature                | Local              | Remote             |
|-------------------------|--------------------|--------------------|
| Capabilities            | :heavy_check_mark: | :heavy_check_mark: |
| Get state               | :heavy_check_mark: | :heavy_check_mark: |
| Set state               | :heavy_check_mark: | :heavy_check_mark: |
| Get brightness          | :heavy_check_mark: | :heavy_check_mark: |
| Set brightness          | :heavy_check_mark: | :heavy_check_mark: |
| Get color temp          | :heavy_check_mark: | :heavy_check_mark: |
| Set color temp          | :heavy_check_mark: | :heavy_check_mark: |
| Get color               | :heavy_check_mark: | :heavy_check_mark: |
| Set color               | :heavy_check_mark: | :heavy_check_mark: |
| Get gamut               | :heavy_check_mark: | :heavy_check_mark: |
| Get gradient*           | :heavy_check_mark: | :heavy_check_mark: |
| Set gradient*           | :heavy_check_mark: | :heavy_check_mark: |
| Get effect              | :heavy_check_mark: | :heavy_check_mark: |
| Set effect              | :heavy_check_mark: | :heavy_check_mark: |
| Get timed effect**      | :x:                | :x:                |
| Set timed effect**      | :x:                | :x:                |
| Get available effects   | :heavy_check_mark: | :heavy_check_mark: |
| Get dynamic speed       | :heavy_check_mark: | :heavy_check_mark: |
| Get dynamic status      | :heavy_check_mark: | :heavy_check_mark: |
| Get mode                | :heavy_check_mark: | :heavy_check_mark: |
| Get powerup config      | :heavy_check_mark: | :heavy_check_mark: |
| Set powerup config      | :heavy_check_mark: | :heavy_check_mark: |
| Get connectivity status | :heavy_check_mark: | :heavy_check_mark: |
| Get zone                | :heavy_check_mark: | :heavy_check_mark: |
| Set zone                | :x:                | :x:                |

>  \* Compliant with Philips Hue API but not tested with physical device
>  ** New feature documented by Philips but not released, so not testable (sunrise effect)

### Accessory

|  Feature                | Local              | Remote             |
|-------------------------|--------------------|--------------------|
| Get connectivity status | :heavy_check_mark: | :heavy_check_mark: |

#### Motion sensor

|  Feature                       | Local              | Remote             |
|--------------------------------|--------------------|--------------------|
| Get enabled status             | :heavy_check_mark: | :heavy_check_mark: |
| Set enabled status             | :heavy_check_mark: | :heavy_check_mark: |
| Motion event                   | :heavy_check_mark: | :x:                |
| Get light level                | :heavy_check_mark: | :heavy_check_mark: |
| Get light level enabled status | :heavy_check_mark: | :heavy_check_mark: |
| Set light level enabled status | :heavy_check_mark: | :heavy_check_mark: |
| Get temperature                | :heavy_check_mark: | :heavy_check_mark: |
| Get temperature enabled status | :heavy_check_mark: | :heavy_check_mark: |
| Set temperature enabled status | :heavy_check_mark: | :heavy_check_mark: |
| Get battery level              | :heavy_check_mark: | :heavy_check_mark: |
| Get battery state              | :heavy_check_mark: | :heavy_check_mark: |

#### Global Switch

|  Feature                       | Local              | Remote             |
|--------------------------------|--------------------|--------------------|
| Get button list                | :heavy_check_mark: | :heavy_check_mark: |
| Get supported press event      | :heavy_check_mark: | :heavy_check_mark: |
| Get button event               | :heavy_check_mark: | :x: |

##### Dimmer switch :x:
No additional support currently
##### Hue button :x:
No additional support currently
##### Wall switch :x:
No additional support currently
##### Tap dial switch :x:
No additional support currently
## Group (room/zone)

|  Feature                       | Local              | Remote             |
|--------------------------------|--------------------|--------------------|
| Create                         | :x:                | :x:                |
| Delete                         | :heavy_check_mark: | :heavy_check_mark: |
| Get name                       | :heavy_check_mark: | :heavy_check_mark: |
| Set name                       | :heavy_check_mark: | :heavy_check_mark: |
| Get archtype                   | :heavy_check_mark: | :heavy_check_mark: |
| Set archtype                   | :heavy_check_mark: | :heavy_check_mark: |
| Create scene                   | :heavy_check_mark: | :heavy_check_mark: |
| Get state                      | :heavy_check_mark: | :heavy_check_mark: |
| Set state                      | :heavy_check_mark: | :heavy_check_mark: |
| Get brightness                 | :heavy_check_mark: | :heavy_check_mark: |
| Set brightness                 | :heavy_check_mark: | :heavy_check_mark: |
| Set color temp                 | :heavy_check_mark: | :heavy_check_mark: |
| Set color                      | :heavy_check_mark: | :heavy_check_mark: |

### Room

|  Feature                       | Local              | Remote             |
|--------------------------------|--------------------|--------------------|
| Add device                     | :heavy_check_mark: | :heavy_check_mark: |
| Remove device                  | :heavy_check_mark: | :heavy_check_mark: |

### Zone

|  Feature                       | Local              | Remote             |
|--------------------------------|--------------------|--------------------|
| Add light                      | :heavy_check_mark: | :heavy_check_mark: |
| Remove light                   | :heavy_check_mark: | :heavy_check_mark: |

## Scene

|  Feature                       | Local              | Remote             |
|--------------------------------|--------------------|--------------------|
| Get name                       | :heavy_check_mark: | :heavy_check_mark: |
| Set name                       | :heavy_check_mark: | :heavy_check_mark: |
| Get image                      | :heavy_check_mark: | :heavy_check_mark: |
| Set image (on creation)        | :heavy_check_mark: | :heavy_check_mark: |
| Get action                     | :heavy_check_mark: | :heavy_check_mark: |
| Set action (like Light)        | :heavy_check_mark: | :heavy_check_mark: |
| Get auto dynamic               | :heavy_check_mark: | :heavy_check_mark: |
| Set auto dynamic               | :heavy_check_mark: | :heavy_check_mark: |
| Get palette                    | :heavy_check_mark: | :heavy_check_mark: |
| Set palette                    | :heavy_check_mark: | :heavy_check_mark: |
| Get palette brightness         | :heavy_check_mark: | :heavy_check_mark: |
| Set palette brightness         | :heavy_check_mark: | :heavy_check_mark: |
| Get palette color              | :heavy_check_mark: | :heavy_check_mark: |
| Set palette color              | :heavy_check_mark: | :heavy_check_mark: |
| Get palette color temp         | :heavy_check_mark: | :heavy_check_mark: |
| Set palette color temp         | :heavy_check_mark: | :heavy_check_mark: |
| Get palette speed              | :heavy_check_mark: | :heavy_check_mark: |
| Set palette speed              | :heavy_check_mark: | :heavy_check_mark: |
| Delete                         | :heavy_check_mark: | :heavy_check_mark: |

## Automation
### Behavior :x:
Not supported currently
### Rule :x:
Not supported currently
### Schedule :x:
Not supported currently

## Entertainment :x:
Not supported currently

## Matter :x:
Not supported currently

## Homekit :x:
Not supported currently

