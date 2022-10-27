import Color from "./Color.js";
import ArgumentError from "./error/ArgumentError.js";


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
	_mirek;

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

	static kelvinToMired(kelvin)
	{
		if (kelvin)
			return (Math.max(153 , Math.min(1e6 / kelvin, 500)));
	}

	static miredToKelvin(mired)
	{
		if (mired)
			return (1e6 / mired);
	}

	static miredToRGB(mired)
	{return (Mired.kelvinToRGB(Mired.miredToKelvin(mired)))}

	static kelvinToRGB(kelvin)
	{
		let temperature;
		let red, green, blue;
	
		if (!kelvin)
			return;
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
		return ({r: Math.round(red), g: Math.round(green), b: Math.round(blue)});
	}

	static RGBToMired(rgb)
	{return (Mired.kelvinToMired(Mired.RGBToKelvin(rgb)))}
	
	static RGBToKelvin(rgb)
	{
		let temperature, testRGB;
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

	constructor(mired)
	{
		let value;

		if (mired instanceof Mired)
			this._mirek = Math.max(153 , Math.min(mired._mirek, 500));
		else if (mired instanceof Color)
			this._mirek = Mired.RGBToMired(Color.HEXToRGB(mired.hex()));
		else if (typeof mired == "number")
			this._mirek = Math.max(153 , Math.min(mired, 500));
		else if (pattern.KELVIN.test(mired))
		{
			value = mired.match(pattern.KELVIN).map(x => parseInt(x));
			this._mirek = Mired.kelvinToMired(value[1]);
		}
		else if (typeof mired?.r == "number" && typeof mired?.g == "number" && typeof mired?.b == "number")
			this._mirek = Mired.RGBToMired(mired);
		else if (typeof mired?.h == "number" && typeof mired?.s == "number" && typeof mired?.v == "number")
			this._mirek = Mired.RGBToMired(Color.HSVToRGB(mired.h, mired.s, mired.v, (typeof mired.a == "number") ? (mired.a * 255) : 255));
		else if (typeof mired?.h == "number" && typeof mired?.s == "number" && typeof mired?.l == "number")
			this._mirek = Mired.RGBToMired(Color.HSLToRGB(mired.h, mired.s, mired.l, (typeof mired.a == "number") ? (mired.a * 255) : 255));
		else if (pattern.HEX.test(mired))
			this._mirek = Mired.RGBToMired(Color.HEXToRGB(mired));
		else if (pattern.RGB.test(mired))
		{
			value = mired.match(pattern.RGB).map(x => parseInt(x));
			this._mirek = Mired.RGBToMired({r: value[1], g: value[2], b: value[3]});
		}
		else if (pattern.HSV.test(mired))
		{
			value = mired.match(pattern.HSV).map(x => parseInt(x));
			this._mirek = Mired.RGBToMired(Color.HSVToRGB(value[1], value[2], value[3], (typeof value[4] == "number") ? (value[4] * 255) : 255));
		}
		else if (pattern.HSL.test(mired))
		{
			value = mired.match(pattern.HSL).map(x => parseInt(x));
			this._mirek = Mired.RGBToMired(Color.HSLToRGB(value[1], value[2], value[3], (typeof value[4] == "number") ? (value[4] * 255) : 255));
		}
		else
			throw new ArgumentError(this, "constructor", "mired", mired, [Mired, Color, "number", "string", "object"])
	}

	mirek()
	{return (Math.max(153 , Math.min(this._mirek, 500)))}

	setMirek(mired)
	{
		if (typeof mired == "number")
			this._mirek = mired;
		else
			throw new ArgumentError(this, "setMirek", "mired", mired, ["number"])
	}

	kelvin()
	{return (Mired.miredToKelvin(this._mirek))}
	
	setKelvin(kelvin)
	{
		let value;

		if (pattern.KELVIN.test(kelvin))
		{
			value = kelvin.match(pattern.KELVIN).map(x => parseInt(x));
			this._mirek = Mired.kelvinToMired(value[1]);
		}
		else
			throw new ArgumentError(this, "setKelvin", "kelvin", kelvin, ["string"])
	}

	color()
	{return (new Color(Mired.miredToRGB(this._mirek)))}
}
