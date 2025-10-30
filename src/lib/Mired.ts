import Color, { ColorValue, isHSL, isHSV, isRGB, RGBValue } from "./Color";
import ExtError from "./error";

const pattern =
{
	KELVIN: /^\d+k$/i,
	HEX: /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i,
	RGB: /^rgba?\(\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})\s*[,\s]\s*([0-1]?(?:\.\d+)?)\)$/i,
	HSL: /^hsla?\(\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})%\s*[,\s]\s*(\d{1,3})%\s*[,\s]\s*([0-1]?(?:\.\d+)?)\)$/i,
	HSV: /^hsva\(\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})%\s*[,\s]\s*(\d{1,3})%\s*[,\s]\s*([0-1]?(?:\.\d+)?)\)$/i,
};

export default class Mired
{
	protected _mirek: number;

	/**
	 * The unit of color temperature
	 *
	 * @enum {string}
	 * @readonly
	 */
	static Unit =
	{
		MIRED: "mired",
		KELVIN: "kelvin",
		RGB: "rgb",
		HSV: "hsv",
		HEX: "hex"
	}

	static kelvinToMired(kelvin: number)
	{
		return (Math.max(153 , Math.min(1e6 / kelvin, 500)));
	}

	static miredToKelvin(mired: number)
	{
		return (1e6 / mired);
	}

	static miredToRGB(mired: number)
	{return (Mired.kelvinToRGB(Mired.miredToKelvin(mired)))}

	static kelvinToRGB(kelvin: number)
	{
		let temperature;
		let red, green, blue;

		temperature = kelvin / 100.0;
		if (temperature < 66.0)
			red = 255;
		else
		{
			red = temperature - 60;
    		red = 329.698727466 * Math.pow(red, -0.1332047592);
			red = Math.min(Math.max(red, 0), 255);
		}

		if (temperature < 66.0)
		{
			green = temperature - 2;
			green = -155.25485562709179 - 0.44596950469579133 * green + 104.49216199393888 * Math.log(green);
			green = Math.min(Math.max(green, 0), 255);
		}
		else
		{
			green = temperature - 50.0;
			green = 325.4494125711974 + 0.07943456536662342 * green - 28.0852963507957 * Math.log(green);
			green = Math.min(Math.max(green, 0), 255);
		}

		if (temperature >= 66.0)
			blue = 255;
		else
		{
			if (temperature <= 20.0)
				blue = 0;
			else
			{
				blue = temperature - 10;
				blue = -254.76935184120902 + 0.8274096064007395 * blue + 115.67994401066147 * Math.log(blue);
				blue = Math.min(Math.max(blue, 0), 255);
			}
		}
		return ({r: Math.round(red), g: Math.round(green), b: Math.round(blue)} as RGBValue);
	}

	static RGBToMired(rgb: RGBValue)
	{return (Mired.kelvinToMired(Mired.RGBToKelvin(rgb)))}

	static RGBToKelvin(rgb: RGBValue)
	{
		let temperature: number = 0, testRGB: RGBValue | undefined;
		let epsilon = 0.4;
		let minTemperature = 1000;
		let maxTemperature = 40000;

		while (maxTemperature - minTemperature > epsilon)
		{
			temperature = (maxTemperature + minTemperature) / 2;
			testRGB = Mired.kelvinToRGB(temperature);
			if ((testRGB.b / testRGB.r) >= (rgb.b / rgb.r))
				maxTemperature = temperature;
			else
				minTemperature = temperature;
		}
		return (Math.round(temperature));
	};

	constructor(mired: Mired | ColorValue | number)
	{
		let value: number[] | undefined;

		if (mired instanceof Mired)
			this._mirek = mired.mirek();
		else if (mired instanceof Color)
			this._mirek = Mired.RGBToMired(mired.toRGB());
		else if (typeof mired === "number")
			this._mirek = Math.max(153 , Math.min(mired, 500));
		else if (typeof mired === "string" && pattern.KELVIN.test(mired))
		{
			value = mired.match(pattern.KELVIN)?.map(x => parseInt(x));
			if (!value)
				return;
			this._mirek = Mired.kelvinToMired(value?.[1]);
		}
		else if (isRGB(mired))
			this._mirek = Mired.RGBToMired(mired);
		else if (isHSV(mired))
			this._mirek = Mired.RGBToMired(Color.HSVToRGB(mired.h, mired.s, mired.v, (typeof mired.a === "number") ? (mired.a * 255) : 255));
		else if (isHSL(mired))
			this._mirek = Mired.RGBToMired(Color.HSLToRGB(mired.h, mired.s, mired.l, (typeof mired.a === "number") ? (mired.a * 255) : 255));
		else if (typeof mired === "string" && pattern.HEX.test(mired))
			this._mirek = Mired.RGBToMired(Color.HEXToRGB(mired));
		else if (typeof mired === "string" && pattern.RGB.test(mired))
		{
			value = mired.match(pattern.RGB)?.map(x => parseInt(x));
			if (!value)
				return;
			this._mirek = Mired.RGBToMired({r: value[1], g: value[2], b: value[3]});
		}
		else if (typeof mired === "string" && pattern.HSV.test(mired))
		{
			value = mired.match(pattern.HSV)?.map(x => parseInt(x));
			if (!value)
				return;
			this._mirek = Mired.RGBToMired(Color.HSVToRGB(value[1], value[2], value[3], (typeof value[4] === "number") ? (value[4] * 255) : 255));
		}
		else if (typeof mired === "string" && pattern.HSL.test(mired))
		{
			value = mired.match(pattern.HSL)?.map(x => parseInt(x));
			if (!value)
				return;
			this._mirek = Mired.RGBToMired(Color.HSLToRGB(value[1], value[2], value[3], (typeof value[4] === "number") ? (value[4] * 255) : 255));
		}
		else
			throw new ExtError("Mired bad format");
	}

	mirek()
	{return (Math.max(153 , Math.min(this._mirek ?? 0, 500)))}

	setMirek(mired: number)
	{
		this._mirek = mired;
	}

	kelvin()
	{return (Mired.miredToKelvin(this._mirek))}

	setKelvin(kelvin: string)
	{
		let value: number | undefined;

		if (typeof kelvin === "string" && pattern.KELVIN.test(kelvin))
		{
			value = kelvin.match(pattern.KELVIN)?.map(x => parseInt(x)).at(1);
			if (value === undefined)
				return;
			this._mirek = Mired.kelvinToMired(value);
		}
		else
			throw new ExtError("Kelvin bad format")
	}

	color()
	{return (new Color(Mired.miredToRGB(this._mirek)))}
}
