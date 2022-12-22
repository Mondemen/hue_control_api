import ArgumentError from "./error/ArgumentError.js";

/**
 * @typedef XYValue
 * @type {Object}
 * @property {number} x - X coordinate
 * @property {number} y - Y coordinate
 * @property {number} brightness - Brightness value
 * 
 * @typedef RGBValue
 * @type {Object}
 * @property {number} r - Red value
 * @property {number} b - Blue value
 * @property {number} b - Red value
 * @property {number} a - Alpha value
 * 
 * @typedef HSVValue
 * @type {Object}
 * @property {number} h - Hue value
 * @property {number} s - Saturation value
 * @property {number} v - Value
 * 
 * @typedef HSLValue
 * @type {Object}
 * @property {number} h - Hue value
 * @property {number} s - Saturation value
 * @property {number} l - Luminance value
 * 
 * @typedef {string|XYValue|RGBValue|HSVValue|HSLValue} ColorValue
 */

const presetColor =
{
	transparent: "#00000000",
	aliceblue: "#f0f8ff",
	antiquewhite: "#faebd7",
	aqua: "#00ffff",
	aquamarine: "#7fffd4",
	azure: "#f0ffff",
	beige: "#f5f5dc",
	bisque: "#ffe4c4",
	black: "#000000",
	blanchedalmond: "#ffebcd",
	blue: "#0000ff",
	blueviolet: "#8a2be2",
	brown: "#a52a2a",
	burlywood: "#deb887",
	cadetblue: "#5f9ea0",
	chartreuse: "#7fff00",
	chocolate: "#d2691e",
	coral: "#ff7f50",
	cornflowerblue: "#6495ed",
	cornsilk: "#fff8dc",
	crimson: "#dc143c",
	cyan: "#00ffff",
	darkblue: "#00008b",
	darkcyan: "#008b8b",
	darkgoldenrod: "#b8860b",
	darkgray: "#a9a9a9",
	darkgreen: "#006400",
	darkgrey: "#a9a9a9",
	darkkhaki: "#bdb76b",
	darkmagenta: "#8b008b",
	darkolivegreen: "#556b2f",
	darkorange: "#ff8c00",
	darkorchid: "#9932cc",
	darkred: "#8b0000",
	darksalmon: "#e9967a",
	darkseagreen: "#8fbc8f",
	darkslateblue: "#483d8b",
	darkslategrey: "#2f4f4f",
	darkturquoise: "#00ced1",
	darkviolet: "#9400d3",
	deeppink: "#ff1493",
	deepskyblue: "#00bfff",
	dimgray: "#696969",
	dimgrey: "#696969",
	dodgerblue: "#1e90ff",
	firebrick: "#b22222",
	floralwhite: "#fffaf0",
	forestgreen: "#228b22",
	fuchsia: "#ff00ff",
	gainsboro: "#dcdcdc",
	ghostwhite: "#f8f8ff",
	gold: "#ffd700",
	goldenrod: "#daa520",
	gray: "#808080",
	green: "#008000",
	greenyellow: "#adff2f",
	grey: "#808080",
	honeydew: "#f0fff0",
	hotpink: "#ff69b4",
	indianred: "#cd5c5c",
	indigo: "#4b0082",
	ivory: "#fffff0",
	khaki: "#f0e68c",
	lavender: "#e6e6fa",
	lavenderblush: "#fff0f5",
	lawngreen: "#7cfc00",
	lemonchiffon: "#fffacd",
	lightblue: "#add8e6",
	lightcoral: "#f08080",
	lightcyan: "#e0ffff",
	lightgoldenrodyellow: "#fafad2",
	lightgray: "#d3d3d3",
	lightgreen: "#90ee90",
	lightgrey: "#d3d3d3",
	lightpink: "#ffb6c1",
	lightsalmon: "#ffa07a",
	lightseagreen: "#20b2aa",
	lightskyblue: "#87cefa",
	lightslategrey: "#778899",
	lightsteelblue: "#b0c4de",
	lightyellow: "#ffffe0",
	lime: "#00ff00",
	limegreen: "#32cd32",
	linen: "#faf0e6",
	magenta: "#ff00ff",
	maroon: "#800000",
	mediumaquamarine: "#66cdaa",
	mediumblue: "#0000cd",
	mediumorchid: "#ba55d3",
	mediumpurple: "#9370db",
	mediumseagreen: "#3cb371",
	mediumslateblue: "#7b68ee",
	mediumspringgreen: "#00fa9a",
	mediumturquoise: "#48d1cc",
	mediumvioletred: "#c71585",
	midnightblue: "#191970",
	mintcream: "#f5fffa",
	mistyrose: "#ffe4e1",
	moccasin: "#ffe4b5",
	navajowhite: "#ffdead",
	navy: "#000080",
	oldlace: "#fdf5e6",
	olive: "#808000",
	olivedrab: "#6b8e23",
	orange: "#ffa500",
	orangered: "#ff4500",
	orchid: "#da70d6",
	palegoldenrod: "#eee8aa",
	palegreen: "#98fb98",
	paleturquoise: "#afeeee",
	palevioletred: "#db7093",
	papayawhip: "#ffefd5",
	peachpuff: "#ffdab9",
	peru: "#cd853f",
	pink: "#ffc0cb",
	plum: "#dda0dd",
	powderblue: "#b0e0e6",
	purple: "#800080",
	rebeccapurple: "#663399",
	red: "#ff0000",
	rosybrown: "#bc8f8f",
	royalblue: "#4169e1",
	saddlebrown: "#8b4513",
	salmon: "#fa8072",
	sandybrown: "#f4a460",
	seagreen: "#2e8b57",
	seashell: "#fff5ee",
	sienna: "#a0522d",
	silver: "#c0c0c0",
	skyblue: "#87ceeb",
	slateblue: "#6a5acd",
	slategray: "#708090",
	snow: "#fffafa",
	springgreen: "#00ff7f",
	steelblue: "#4682b4",
	tan: "#d2b48c",
	teal: "#008080",
	thistle: "#d8bfd8",
	tomato: "#ff6347",
	turquoise: "#40e0d0",
	violet: "#ee82ee",
	wheat: "#f5deb3",
	white: "#ffffff",
	whitesmoke: "#f5f5f5",
	yellow: "#ffff00",
	yellowgreen: "#9acd32"
};
const pattern =
{
	HEX: /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i,
	RGB: /^rgba?\(\s*(\d{1,3}(?:\.\d+)?)\s*[,\s]\s*(\d{1,3}(?:\.\d+)?)\s*[,\s]\s*(\d{1,3}(?:\.\d+)?)\s*[,\s]\s*([0-1]?(?:\.\d+)?)\)$/i,
	HSL: /^hsla?\(\s*(\d{1,3}(?:\.\d+)?)\s*[,\s]\s*(\d{1,3}(?:\.\d+)?)%\s*[,\s]\s*(\d{1,3}(?:\.\d+)?)%\s*[,\s]\s*([0-1]?(?:\.\d+)?)\)$/i,
	HSV: /^hsva\(\s*(\d{1,3}(?:\.\d+)?)\s*[,\s]\s*(\d{1,3}(?:\.\d+)?)%\s*[,\s]\s*(\d{1,3}(?:\.\d+)?)%\s*[,\s]\s*([0-1]?(?:\.\d+)?)\)$/i,
};

export default class Color
{
	/**
	 * @type {object}
	 * @property {number} r - The red channel
	 * @property {number} g - The green channel
	 * @property {number} b - The blue channel
	 * @property {number} a - The alpha channel
	 * @private
	 */
	_rgb;

	/**
	 * The unit of color
	 * 
	 * @enum {string}
	 * @readonly
	 */
	static Unit =
	{
		RGB: "rgb",
		HSV: "hsv",
		HEX: "hex",
		XY: "xy"
	}

	static RGBToXY(red, green, blue, gamut = {red: {x: 1, y: 0}, green: {x: 0, y: 1}, blue: {x: 0, y: 0}})
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
		xy = {x: (x + y + z) ? (x / (x + y + z)) : x, y: (x + y + z) ? (y / (x + y + z)) : y};
		if (!Color.XYIsInGamutRange(xy, gamut))
			xy = Color.getClosestColor(xy, gamut);
		return ({...xy, brightness: y});
	}

	static XYIsInGamutRange(xy, gamut)
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
		let getClosestPoint = (xy, pointA, pointB, name)  =>
		{
			let lineSize = getLineDistance(pointA, pointB);
			let xy2a = {x: xy.x - pointA.x, y: xy.y - pointA.y};
			let a2b = {x: pointB.x - pointA.x, y: pointB.y - pointA.y};
			let a2bSqr = Math.pow(a2b.x, 2) + Math.pow(a2b.y, 2);
			let xy2a_dot_a2b = xy2a.x * a2b.x + xy2a.y * a2b.y;
			let t = xy2a_dot_a2b / a2bSqr;
			let point = {x: pointA.x + a2b.x * t, y: pointA.y + a2b.y * t};

			if (getLineDistance(point, pointA) > lineSize)
				point = pointB;
			else if (getLineDistance(point, pointB) > lineSize)
				point = pointA;
			return (point);
		}

		greenBlue = {a: gamut.green, b: gamut.blue};
		greenRed = {a: gamut.green, b: gamut.red};
		blueRed = {a: gamut.red, b: gamut.blue};

		closestColorPoints =
		{
			greenBlue: getClosestPoint(xy, greenBlue.a, greenBlue.b),
			greenRed: getClosestPoint(xy, greenRed.a, greenRed.b),
			blueRed: getClosestPoint(xy, blueRed.a, blueRed.b)
		};
		distance =
		{
			greenBlue: getLineDistance(xy, closestColorPoints.greenBlue),
			greenRed: getLineDistance(xy, closestColorPoints.greenRed),
			blueRed: getLineDistance(xy, closestColorPoints.blueRed)
		};
		for (let line in distance)
		{
			if (!closestDistance)
			{
				closestDistance = distance[line];
				closestColor = line;
			}
			if (closestDistance > distance[line])
			{
				closestDistance = distance[line];
				closestColor = line;
			}
		}
		return  (closestColorPoints[closestColor]);
	}
	
	static XYBriToHEX(x, y, brightness = 1, a)
	{
		let rgb = Color.XYBriToRGB(x, y, brightness);

		return (Color.RGBToHEX(rgb.r, rgb.g, rgb.b, a));
	}

	static XYBriToRGB(x, y, brightness = 1, a)
	{
		let X, Y, Z;
		let z;
		let r, g, b;
		let red = 0, green = 0, blue = 0;
		let maxValue;
		let getReversedGammaCorrectedValue = value => (value <= 0.0031308) ? 12.92 * value : (1.0 + 0.055) * Math.pow(value, (1.0 / 2.4)) - 0.055;

		if (!x && !y)
			return ({r: red, g: green, b: blue});
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

	static RGBToHEX(r, g, b, a)
	{
		let result = "#";

		result += Math.round(r).toString(16).padStart(2, "0");
		result += Math.round(g).toString(16).padStart(2, "0");
		result += Math.round(b).toString(16).padStart(2, "0");
		if (typeof a == "number")
			result += Math.round(a).toString(16).padStart(2, "0");
		return (result.toUpperCase());
	}

	static RGBtoHSV(r, g, b, a)
	{
		let min, max;
		let h, s, v, d;

		r /= 255, g /= 255, b /= 255;
		max = Math.max(r, g, b);
		min = Math.min(r, g, b);
		v = max;
		d = max - min;
		s = max == 0 ? 0 : d / max;
		if (max == min)
			h = 0;
		else
		{
			switch (max)
			{
				case r: h = (g - b) / d + (g < b ? 6 : 0); break;
				case g: h = (b - r) / d + 2; break;
				case b: h = (r - g) / d + 4; break;
			}
			h /= 6;
		}
		return {h: h * 360, s: s * 100, v: v * 100, a};
	}

	static RGBToHSL(r, g, b, a)
	{
		let max, min;
		let h, s, l;
		let d;

		r /= 255, g /= 255, b /= 255;
		max = Math.max(r, g, b);
		min = Math.min(r, g, b);
		h = (max + min) / 2;
		s = (max + min) / 2;
		l = (max + min) / 2;	
		if (max == min)
			h = s = 0;
		else
		{
			d = max - min;
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
			switch(max)
			{
				case r: h = (g - b) / d + (g < b ? 6 : 0); break;
				case g: h = (b - r) / d + 2; break;
				case b: h = (r - g) / d + 4; break;
			}
			h /= 6;
		}
		if (typeof a == "number")
			return (`hsla(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%, ${a / 255})`);
		return (`hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`);
	}

	static HSVToRGB(h, s, v, a)
	{
		var r, g, b, i, f, p, q, t;
	
		h /= 360;
		s /= 100;
		v /= 100;
		i = Math.floor(h * 6);
		f = h * 6 - i;
		p = v * (1 - s);
		q = v * (1 - f * s);
		t = v * (1 - (1 - f) * s);
		switch (i % 6)
		{
			case 0: r = v, g = t, b = p; break;
			case 1: r = q, g = v, b = p; break;
			case 2: r = p, g = v, b = t; break;
			case 3: r = p, g = q, b = v; break;
			case 4: r = t, g = p, b = v; break;
			case 5: r = v, g = p, b = q; break;
		}
		return ({r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255), a});
	}

	static HSLToRGB(h, s, l, a)
	{
		let r, g, b;
		let q, p;
		let hue2rgb = (p, q, t) =>
		{
			if (t < 0)
				t += 1;
			if (t > 1)
				t -= 1;
			if (t < 1/6)
				return (p + (q - p) * 6 * t);
			if (t < 1/2)
				return (q);
			if (t < 2/3)
				return (p + (q - p) * (2/3 - t) * 6);
			return (p);
		}

		if (s == 0)
			r = g = b = l;
		else
		{
			q = l < 0.5 ? l * (1 + s) : l + s - l * s;
			p = 2 * l - q;
			r = hue2rgb(p, q, h + 1/3);
			g = hue2rgb(p, q, h);
			b = hue2rgb(p, q, h - 1/3);
		}
		return ({r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255), a});
	}

	static HEXToRGB(hex)
	{
		let result;

		hex = hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])([a-f\d])?$/i, (m, r, g, b, a = "") => '#' + r + r + g + g + b + b + a + a);
		hex = hex.match(pattern.HEX).map(x => (x != undefined) ? parseInt(x, 16) : undefined);
		result = {r: hex[1], g: hex[2], b: hex[3], a: 255};
		if (hex[4] != undefined)
			result.a = hex[4];
		return (result);
	}

	static luminance(r, g, b, a, lum = 0)
	{
		r = Math.round(Math.min(Math.max(0, r + (r * lum)), 255));
		g = Math.round(Math.min(Math.max(0, g + (g * lum)), 255));
		b = Math.round(Math.min(Math.max(0, b + (b * lum)), 255));
		return ({r, g, b, a});
	}

	/**
	 * @param {ColorValue} color - The color value
	 */
	constructor(color)
	{
		this.set(color, "constructor");
	}

	[Symbol.for('nodejs.util.inspect.custom')](depth, inspectOptions, inspect)
	{
		return (
		{
			xy: this.xy(),
			hex: this.hex(),
			rgb: this.rgb(),
			hsl: this.hsl()
		})
	}

	[Symbol.toPrimitive](depth, inspectOptions, inspect)
	{return (this.toRGB())}
	
	/**
	 * Sets the color
	 * 
	 * @param {ColorValue} color - Color to set
	 */
	set(color, func = "set")
	{
		let value;

		if (color instanceof Color)
			this._rgb = {...color._rgb};
		else if (typeof color?.x == "number" && typeof color?.y == "number")
			this._rgb = Color.XYBriToRGB(color.x, color.y, color.brightness);
		else if (typeof color?.r == "number" && typeof color?.g == "number" && typeof color?.b == "number")
		{
			this._rgb = {r: Math.round(color.r), g: Math.round(color.g), b: Math.round(color.b)};
			if (typeof color?.a == "number")
				this._rgb.a = Math.round(color.a);
		}
		else if (typeof color?.h == "number" && typeof color?.s == "number" && typeof color?.v == "number")
			this.setHSV(color);
		else if (typeof color?.h == "number" && typeof color?.s == "number" && typeof color?.l == "number")
			this.setHSL(color);
		else if (presetColor[color?.toLowerCase?.()])
			this.setHEX(presetColor[color?.toLowerCase?.()]);
		else if (pattern.HEX.test(color))
			this.setHEX(color)
		else if (pattern.RGB.test(color))
		{
			value = color.match(pattern.RGB).map(x => parseInt(x));
			this._rgb = {r: Math.round(value[1]), g: Math.round(value[2]), b: Math.round(value[3])};
			if (typeof value[4] == "number")
				this._rgb.a = Math.round(value[4] * 255);
		}
		else if (pattern.HSV.test(color))
			this.setHSV(color);
		else if (pattern.HSL.test(color))
			this.setHSL(color);
		else
			throw new ArgumentError(this, func, "color", color, [Color, "string", "object"])
	}

	xy(gamut)
	{return (Color.RGBToXY(this._rgb.r, this._rgb.g, this._rgb.b, gamut))}

	hex()
	{return (Color.RGBToHEX(this._rgb.r, this._rgb.g, this._rgb.b, this._rgb.a))}

	rgb()
	{
		if (typeof this._rgb.a == "number")
			return (`rgba(${this._rgb.r}, ${this._rgb.g}, ${this._rgb.b}, ${this._rgb.a / 255})`);
		return (`rgb(${this._rgb.r}, ${this._rgb.g}, ${this._rgb.b})`);
	}

	toRGB()
	{return ({...this._rgb, a: (this._rgb.a ?? 255) / 255})}

	/**
	 * Sets color from HSV
	 * 
	 * @param {HSVValue} hsv - The HSV value
	 */
	 setHSV(hsv)
	{
		if (typeof hsv?.h == "number" && typeof hsv?.s == "number" && typeof hsv?.v == "number")
		{
			value = Color.HSVToRGB(hsv.h, hsv.s, hsv.v, (typeof hsv.a == "number") ? (hsv.a * 255) : 255);
			this._rgb = {r: Math.round(value.r), g: Math.round(value.g), b: Math.round(value.b)};
			if (typeof value.a == "number")
				this._rgb.a = Math.round(value.a);
		}
		else if (pattern.HSV.test(hsv))
		{
			value = hsv.match(pattern.HSV).map(x => parseInt(x));
			value = Color.HSVToRGB(value[1], value[2], value[3], (typeof value[4] == "number") ? (value[4] * 255) : 255);
			this._rgb = {r: Math.round(value.r), g: Math.round(value.g), b: Math.round(value.b)};
			if (typeof value.a == "number")
				this._rgb.a = Math.round(value.a);
		}
		else
			throw new ArgumentError(this, "setHSV", "hsv", hsv, ["object", "string"]);
	}

	/**
	 * Sets color from HSL
	 * 
	 * @param {HSLValue} hsl - The HSL value
	 */
	setHSL(hsl)
	{
		if (typeof hsl?.h == "number" && typeof hsl?.s == "number" && typeof hsl?.l == "number")
		{
			value = Color.HSLToRGB(hsl.h, hsl.s, hsl.l, (typeof hsl.a == "number") ? (hsl.a * 255) : 255);
			this._rgb = {r: Math.round(value.r), g: Math.round(value.g), b: Math.round(value.b)};
			if (typeof value.a == "number")
				this._rgb.a = Math.round(value.a);
		}
		else if (pattern.HSL.test(hsl))
		{
			value = hsl.match(pattern.HSL).map(x => parseInt(x));
			value = Color.HSLToRGB(value[1], value[2], value[3], (typeof value[4] == "number") ? (value[4] * 255) : 255);
			this._rgb = {r: Math.round(value.r), g: Math.round(value.g), b: Math.round(value.b)};
			if (typeof value.a == "number")
				this._rgb.a = Math.round(value.a);
		}
		else
			throw new ArgumentError(this, "setHSL", "hsl", hsl, ["object", "string"]);
	}

	/**
	 * Sets the color from HEX
	 * 
	 * @param {string} hex - The HEX value
	 */
	setHEX(hex)
	{
		let value;
		
		if (pattern.HEX.test(hex))
		{
			value = Color.HEXToRGB(hex);
			this._rgb = {r: Math.round(value.r), g: Math.round(value.g), b: Math.round(value.b)};
			if (typeof value?.a == "number")
				this._rgb.a = Math.round(value.a);
		}
		else
			throw new ArgumentError(this, "setHEX", "hex", hex, ["string"]);
	}

	hsv()
	{return (Color.RGBtoHSV(this._rgb.r, this._rgb.g, this._rgb.b, this._rgb.a))}
	
	hsl()
	{return (Color.RGBToHSL(this._rgb.r, this._rgb.g, this._rgb.b, this._rgb.a))}

	luminance(level = 0)
	{return (new Color(Color.luminance(this._rgb.r, this._rgb.g, this._rgb.b, this._rgb.a, level)))}

	brightness(brightness = 100)
	{return (this.luminance(-((100 - Math.abs(brightness)) / 100)))}

	isLight()
	{return ((((this._rgb.r * 299) + (this._rgb.g * 587) + (this._rgb.b * 114)) / 1000) >= 128)}

	isDark()
	{return (!this.isLight())}

	get r() {return (this._rgb.r)}
	get g() {return (this._rgb.g)}
	get b() {return (this._rgb.b)}
	get a() {return ((this._rgb.a ?? 255) / 255)}
	
	set r(r) {this._rgb.r = Math.round(r)}
	set g(g) {this._rgb.g = Math.round(g)}
	set b(b) {this._rgb.b = Math.round(b)}
	set a(a) {this._rgb.a = Math.round(a)}
}

