export default class Color
{
	static rgbToXy(red, green, blue, gamut = {red: {x: 1, y: 0}, green: {x: 0, y: 1}, blue: {x: 0, y: 0}})
	{
		let x, y, z;
		let xy;
		let getGammaCorrectedValue = value => (value > 0.04045) ? Math.pow((value + 0.055) / (1.0 + 0.055), 2.4) : (value / 12.92);

		red = getGammaCorrectedValue(parseFloat(red / 255));
		green = getGammaCorrectedValue(parseFloat(green / 255));
		blue = getGammaCorrectedValue(parseFloat(blue / 255));
		x = red * 0.664511 + green * 0.154324 + blue * 0.162028;
		y = red * 0.283881 + green * 0.668433 + blue * 0.047685;
		z = red * 0.000088 + green * 0.072310 + blue * 0.986039;
		xy = {x: x / (x + y + z), y: y / (x + y + z)};
		if (!Color.xyIsInGamutRange(xy, gamut))
			xy = Color.getClosestColor(xy, gamut);
		return ({...xy, brightness: y});
	}

	static xyIsInGamutRange(xy, gamut)
	{
		let v0, v1, v2;
		let dot00, dot01, dot02, dot11, dot12;
		let invDenom;
		let u, v;

		if (Array.isArray(xy))
			xy = {x: xy[0], y: xy[1]};
		v0 = {x: gamut.blue.x - gamut.red.x, y: gamut.blue.y - gamut.red.y};
		v1 = {x: gamut.green.x - gamut.red.x, y: gamut.green.y - gamut.red.y};
		v2 = {x: xy.x - gamut.red.x, y: xy.y - gamut.red.y};
		dot00 = (v0.x * v0.x) + (v0.y * v0.y);
		dot01 = (v0.x * v1.x) + (v0.y * v1.y);
		dot02 = (v0.x * v2.x) + (v0.y * v2.y);
		dot11 = (v1.x * v1.x) + (v1.y * v1.y);
		dot12 = (v1.x * v2.x) + (v1.y * v2.y);
		invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
		u = (dot11 * dot02 - dot01 * dot12) * invDenom;
		v = (dot00 * dot12 - dot01 * dot02) * invDenom;
		return ((u >= 0) && (v >= 0) && (u + v < 1));
	}

	static getClosestColor(xy, gamut)
	{
		let greenBlue, greenRed, blueRed;
		let closestColorPoints;
		let distance;
		let closestDistance;
		let closestColor;
		let getLineDistance = (pointA, pointB) => Math.hypot(pointB.x - pointA.x, pointB.y - pointA.y);
		let getClosestPoint = (xy, pointA, pointB)  =>
		{
			let xy2a = {x: xy.x - pointA.x, y: xy.y - pointA.y};
			let a2b = {x: pointB.x - pointA.x, y: pointB.y - pointA.y};
			let a2bSqr = Math.pow(a2b.x, 2) + Math.pow(a2b.y, 2);
			let xy2a_dot_a2b = xy2a.x * a2b.x + xy2a.y * a2b.y;
			let t = xy2a_dot_a2b /a2bSqr;

			return ({x: pointA.x + a2b.x * t, y: pointA.y + a2b.y * t});
		}

		greenBlue = {a: gamut.green, b: gamut.blue};
		greenRed = {a: gamut.green, b: gamut.red};
		blueRed = {a: gamut.red, b: gamut.blue};

		closestColorPoints =
		{
			greenBlue : getClosestPoint(xy, greenBlue.a, greenBlue.b),
			greenRed : getClosestPoint(xy, greenRed.a, greenRed.b),
			blueRed : getClosestPoint(xy, blueRed.a, blueRed.b)
		};
		distance =
		{
			greenBlue : getLineDistance(xy, closestColorPoints.greenBlue),
			greenRed : getLineDistance(xy, closestColorPoints.greenRed),
			blueRed : getLineDistance(xy, closestColorPoints.blueRed)
		};
		for (let i in distance)
		{
			if (distance.hasOwnProperty(i))
			{
				if (!closestDistance)
				{
					closestDistance = distance[i];
					closestColor = i;
				}
				if (closestDistance > distance[i])
				{
					closestDistance = distance[i];
					closestColor = i;
				}
			}
		}
		return  (closestColorPoints[closestColor]);
	}
	
	static xyBriToHex(x, y, brightness = 1)
	{
		let rgb = Color.xyBriToRgb(x, y, brightness);

		if (!x && !y)
			return;
		return (`#${rgb.r.toString(16).padStart(2, 0)}${rgb.g.toString(16).padStart(2, 0)}${rgb.b.toString(16).padStart(2, 0)}`);
	}

	static xyBriToRgb(x, y, brightness = 1)
	{
		let X, Y, Z;
		let z;
		let r, g, b;
		let red, green, blue;
		let maxValue;
		let getReversedGammaCorrectedValue = value => (value <= 0.0031308) ? 12.92 * value : (1.0 + 0.055) * Math.pow(value, (1.0 / 2.4)) - 0.055;

		if (!x && !y)
			return;
		z = 1.0 - x - y;
		Y = brightness;
		X = (Y / y) * x;
		Z = (Y / y) * z;
		r = X * 1.656492 - Y * 0.354851 - Z * 0.255038;
		g = -X * 0.707196 + Y * 1.655397 + Z * 0.036152;
		b = X * 0.051713 - Y * 0.121364 + Z * 1.011530;
		r = getReversedGammaCorrectedValue(r);
		g = getReversedGammaCorrectedValue(g);
		b = getReversedGammaCorrectedValue(b);
		if ((maxValue = Math.max(r, g, b)) > 1)
		{
			r /= maxValue;
			g /= maxValue;
			b /= maxValue;
		}
		red = Math.max(Math.min(Math.round(r * 255), 255), 0);
		green = Math.max(Math.min(Math.round(g * 255), 255), 0);
		blue = Math.max(Math.min(Math.round(b * 255), 255), 0);
		return ({r: red, g: green, b: blue});
	}
}
