export default class Mired
{
	static kelvinToMired(kelvin)
	{
		if (kelvin)
			return (1e6 / kelvin);
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

	static RGBToMired(red, green, blue)
	{return (Mired.kelvinToMired(Mired.RGBToKelvin(red, green, blue)))}
	
	static RGBToKelvin(red, green, blue)
	{
		let temperature, testRGB;
		let epsilon = 0.4;
		let minTemperature = 1000;
		let maxTemperature = 40000;

		while (maxTemperature - minTemperature > epsilon)
		{
			temperature = (maxTemperature + minTemperature) / 2;
			testRGB = Mired.kelvinToRGB(temperature);
			if ((testRGB.b / testRGB.r) >= (blue / red))
				maxTemperature = temperature;
			else
				minTemperature = temperature;
		}
		return (Math.round(temperature));
	};
}