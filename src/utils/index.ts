export const HUE_CA_CERT = `-----BEGIN CERTIFICATE-----
MIICMjCCAdigAwIBAgIUO7FSLbaxikuXAljzVaurLXWmFw4wCgYIKoZIzj0EAwIw
OTELMAkGA1UEBhMCTkwxFDASBgNVBAoMC1BoaWxpcHMgSHVlMRQwEgYDVQQDDAty
b290LWJyaWRnZTAiGA8yMDE3MDEwMTAwMDAwMFoYDzIwMzgwMTE5MDMxNDA3WjA5
MQswCQYDVQQGEwJOTDEUMBIGA1UECgwLUGhpbGlwcyBIdWUxFDASBgNVBAMMC3Jv
b3QtYnJpZGdlMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEjNw2tx2AplOf9x86
aTdvEcL1FU65QDxziKvBpW9XXSIcibAeQiKxegpq8Exbr9v6LBnYbna2VcaK0G22
jOKkTqOBuTCBtjAPBgNVHRMBAf8EBTADAQH/MA4GA1UdDwEB/wQEAwIBhjAdBgNV
HQ4EFgQUZ2ONTFrDT6o8ItRnKfqWKnHFGmQwdAYDVR0jBG0wa4AUZ2ONTFrDT6o8
ItRnKfqWKnHFGmShPaQ7MDkxCzAJBgNVBAYTAk5MMRQwEgYDVQQKDAtQaGlsaXBz
IEh1ZTEUMBIGA1UEAwwLcm9vdC1icmlkZ2WCFDuxUi22sYpLlwJY81Wrqy11phcO
MAoGCCqGSM49BAMCA0gAMEUCIEBYYEOsa07TH7E5MJnGw557lVkORgit2Rm1h3B2
sFgDAiEA1Fj/C3AN5psFMjo0//mrQebo0eKd3aWRx+pQY08mk48=
-----END CERTIFICATE-----`;

const datetimeRegex = /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))/

export function datetimeDeserialize(_key: string, value: any)
{
	if (typeof value === "string")
	{
		try
		{
			if (!isNaN(Date.parse(value)) && datetimeRegex.test(value))
				return (new Date(value));
		}
		catch {}
	}
	return (value);
}

/**
 * @enumerable decorator that sets the enumerable property of a class field to false.
 * @param value true|false
 */
export function enumerable(value: boolean)
{
	return (function (target: any, propertyKey: string)
	{
		const descriptor = Object.getOwnPropertyDescriptor(target, propertyKey) || {};

		if (descriptor.enumerable !== value)
		{
			descriptor.enumerable = value;
			descriptor.writable = true;
			Object.defineProperty(target, propertyKey, descriptor);
		}
	});
}

export function throttle<F extends (...args: any[]) => Promise<void>>(mainFunction: F, delay: number): (...args: Parameters<F>) => Promise<void>;
export function throttle<F extends (...args: any[]) => void>(mainFunction: F, delay: number): (...args: Parameters<F>) => void;
export function throttle<F extends ((...args: any[]) => void) | ((...args: any[]) => Promise<void>)>(mainFunction: F, delay: number): (...args: Parameters<F>) => void | Promise<void>
{
	let timerFlag: NodeJS.Timeout | null = null;

	if (mainFunction.constructor.name === "AsyncFunction")
	{
		return (async (...args) =>
		{
			if (timerFlag === null)
			{
				await mainFunction(...args);
				timerFlag = setTimeout(() => timerFlag = null, delay);
				console.log("TIMER", timerFlag);
			}
		});
	}
	return ((...args) =>
	{
		if (timerFlag === null)
		{
			mainFunction(...args);
			timerFlag = setTimeout(() => timerFlag = null, delay);
		}
	});
}


// async function main()
// {
// 	const func = throttle(async (str: string) =>
// 	{
// 		// await pause(3000);
// 		console.log(str);
// 	}, 1000);

// 	console.log("TOTO 1");
// 	await func("sd")
// 	console.log("TOTO 2");
// }

// main();

Map.prototype.find = function<K, V>(predicate: (value: V, key: K, obj: Map<K, V>) => unknown)
{
	for (const item of this[Symbol.iterator]())
		if (predicate(item[1], item[0], this))
			return (item[1]);
}

Map.prototype.findKey = function<K, V>(predicate: (key: K, value: V, obj: Map<K, V>) => unknown)
{
	for (const item of this[Symbol.iterator]())
		if (predicate(item[0], item[1], this))
			return (item[0]);
}

Map.prototype.filter = function<K, V>(predicate: (value: V, key: K, obj: Map<K, V>) => unknown)
{
	const map = new Map<K, V>();

	for (const item of this[Symbol.iterator]())
		if (predicate(item[1], item[0], this))
			map.set(item[0], item[1]);
	return (map);
}

Map.prototype.map = function<K, V, U>(predicate: (value: V, key: K, obj: Map<K, V>) => U)
{
	const map = new Map<K, U>();

	for (const item of this[Symbol.iterator]())
		map.set(item[0], predicate(item[1], item[0], this));
	return (map);
}

Map.prototype.mapArray = function<K, V, U>(predicate: (value: V, key: K, obj: Map<K, V>) => U)
{
	const res: U[] = [];

	for (const item of this[Symbol.iterator]())
		res.push(predicate(item[1], item[0], this));
	return (res);
}

Map.prototype.array = function<K, V>(this: Map<K, V>)
{
	return (Array.from(this.values()));
}

Map.prototype.arrayKeys = function<K, V>(this: Map<K, V>)
{
	return (Array.from(this.keys()));
}
