import ExtError from "./error";

export interface XYValue
{
	x: number, /** X coordinate */
	y: number, /** Y coordinate */
	// brightness?: number, /** Brightness value */
}

export interface RGBValue
{
	r: number, /** Red value */
	g: number, /** Green value */
	b: number, /** Blue value */
 	a?: number /** Alpha value (optionnal) */
}

export interface HSVValue
{
	h: number, /** Hue value */
	s: number, /** Saturation value */
	v: number, /** Value */
	a?: number /** Alpha value (optionnal) */
}

export interface HSLValue
{
	h: number, /** Hue value */
	s: number, /** Saturation value */
	l: number, /** Luminance value */
	a?: number /** Alpha value (optionnal) */
}

export interface Gamut
{
	red: XYValue;
	green: XYValue;
	blue: XYValue
}

type HexString = `#${string}`;
type RGBString = `rgb(${number},${number},${number})`;
type HSLString = `hsl(${number},${number},${number})`;
type HSVString = `hsv(${number},${number},${number})`;

export type ColorValue = Color | keyof typeof PRESET_COLOR | XYValue | RGBValue | HSVValue | HSLValue | HexString | RGBString | HSLString | HSVString;

export function isXY(color: any): color is XYValue
{return (typeof color?.x === "number" && typeof color?.y === "number")}

export function isRGB(color: any): color is RGBValue
{return (typeof color?.r === "number" && typeof color?.g === "number" && typeof color?.b === "number")}

export function isHSV(color: any): color is HSVValue
{return (typeof color?.h === "number" && typeof color?.s === "number" && typeof color?.v === "number")}

export function isHSL(color: any): color is HSLValue
{return (typeof color?.h === "number" && typeof color?.s === "number" && typeof color?.l === "number")}

const PRESET_COLOR =
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
const STRING_PATTERN =
{
	HEX: /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i,
	RGB: /^rgba?\(\s*(\d{1,3}(?:\.\d+)?)\s*[,\s]\s*(\d{1,3}(?:\.\d+)?)\s*[,\s]\s*(\d{1,3}(?:\.\d+)?)\s*[,\s]\s*([0-1]?(?:\.\d+)?)\)$/i,
	HSL: /^hsla?\(\s*(\d{1,3}(?:\.\d+)?)\s*[,\s]\s*(\d{1,3}(?:\.\d+)?)%\s*[,\s]\s*(\d{1,3}(?:\.\d+)?)%\s*[,\s]\s*([0-1]?(?:\.\d+)?)\)$/i,
	HSV: /^hsva\(\s*(\d{1,3}(?:\.\d+)?)\s*[,\s]\s*(\d{1,3}(?:\.\d+)?)%\s*[,\s]\s*(\d{1,3}(?:\.\d+)?)%\s*[,\s]\s*([0-1]?(?:\.\d+)?)\)$/i,
};

export default class Color
{
	private _xy: XYValue;
	// private _rgb: RGBValue;

	static Unit =
	{
		RGB: "rgb",
		HSV: "hsv",
		HEX: "hex",
		XY: "xy"
	}

	static RGBToXY(red: number, green: number, blue: number, gamut: Gamut = {red: {x: 1, y: 0}, green: {x: 0, y: 1}, blue: {x: 0, y: 0}})
	{
		let x: number, y: number, z: number;
		let xy: XYValue;
		let getGammaCorrectedValue = (value: number) => (value > 0.04045) ? Math.pow((value + 0.055) / (1.0 + 0.055), 2.4) : (value / 12.92);

		red = getGammaCorrectedValue(typeof red === "string" ? parseFloat((parseInt(red) / 255).toString()) : red);
		green = getGammaCorrectedValue(typeof green === "string" ? parseFloat((parseInt(green) / 255).toString()) : green);
		blue = getGammaCorrectedValue(typeof blue === "string" ? parseFloat((parseInt(blue) / 255).toString()) : blue);

		// Other convertor
		x = red * 0.664511 + green * 0.154324 + blue * 0.162028;
		y = red * 0.283881 + green * 0.668433 + blue * 0.047685;
		z = red * 0.000088 + green * 0.072310 + blue * 0.986039;

		// Official convertor (Philips Hue)
		// x = red * 0.4124 + green * 0.3576 + blue * 0.1805;
		// y = red * 0.2126 + green * 0.7152 + blue * 0.0722;
		// z = red * 0.0193 + green * 0.1192 + blue * 0.9505;

		xy = {x: (x + y + z) ? (x / (x + y + z)) : x, y: (x + y + z) ? (y / (x + y + z)) : y};
		if (!Color.XYIsInGamutRange(xy, gamut))
			xy = Color.getClosestColor(xy, gamut);
		return (xy);
	}

	static XYIsInGamutRange(xy: XYValue | [number, number], gamut: Gamut)
	{
		let v0: XYValue, v1: XYValue, v2: XYValue;
		let dot00: number, dot01: number, dot02: number, dot11: number, dot12: number;
		let invDenom: number;
		let u: number, v: number;

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

	static getClosestColor(xy: XYValue, gamut: Gamut): XYValue
	{
		let greenBlue: {a: XYValue, b: XYValue}, greenRed: {a: XYValue, b: XYValue}, blueRed: {a: XYValue, b: XYValue};
		let closestColorPoints: {greenBlue: XYValue, greenRed: XYValue, blueRed: XYValue};
		let distance: {greenBlue: number, greenRed: number, blueRed: number};
		let closestDistance: any;
		let closestColor: any;
		let getLineDistance = (pointA: XYValue, pointB: XYValue) => Math.hypot(pointB.x - pointA.x, pointB.y - pointA.y);
		let getClosestPoint = (xy: XYValue, pointA: XYValue, pointB: XYValue)  =>
		{
			let lineSize = getLineDistance(pointA, pointB);
			let xy2a = {x: xy.x - pointA.x, y: xy.y - pointA.y};
			let a2b = {x: pointB.x - pointA.x, y: pointB.y - pointA.y};
			let a2bSqr = Math.pow(a2b.x, 2) + Math.pow(a2b.y, 2);
			let xy2a_dot_a2b = xy2a.x * a2b.x + xy2a.y * a2b.y;
			let t = xy2a_dot_a2b / a2bSqr;
			let point: XYValue = {x: pointA.x + a2b.x * t, y: pointA.y + a2b.y * t};

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

	static XYBriToHEX(x: number, y: number, brightness = 1)
	{
		let rgb = Color.XYBriToRGB(x, y, brightness);

		return (Color.RGBToHEX(rgb.r, rgb.g, rgb.b));
	}

	static XYBriToRGB(x: number, y: number, brightness = 1)
	{
		let X, Y, Z;
		let z;
		let r, g, b;
		let red = 0, green = 0, blue = 0;
		let maxValue;
		let getReversedGammaCorrectedValue = (value: number) => (value <= 0.0031308) ? 12.92 * value : (1.0 + 0.055) * Math.pow(value, (1.0 / 2.4)) - 0.055;

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

	static RGBToHEX(r: number, g: number, b: number)
	{
		let result = "#";

		result += Math.round(r).toString(16).padStart(2, "0");
		result += Math.round(g).toString(16).padStart(2, "0");
		result += Math.round(b).toString(16).padStart(2, "0");
		return (result.toUpperCase());
	}

	static RGBtoHSV(r: number, g: number, b: number)
	{
		let min, max;
		let h, s, v, d;

		r /= 255;
		g /= 255;
		b /= 255;
		max = Math.max(r, g, b);
		min = Math.min(r, g, b);
		v = max;
		d = max - min;
		s = max === 0 ? 0 : d / max;
		if (max === min)
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
		return {h: h * 360, s: s * 100, v: v * 100};
	}

	static RGBToHSL(r: number, g: number, b: number)
	{
		let max, min;
		let h, s, l;
		let d;

		r /= 255;
		g /= 255;
		b /= 255;
		max = Math.max(r, g, b);
		min = Math.min(r, g, b);
		h = (max + min) / 2;
		s = (max + min) / 2;
		l = (max + min) / 2;
		if (max === min)
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
		return (`hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`);
	}

	static HSVToRGB(h: number, s: number, v: number, a?: number)
	{
		let r = 0, g = 0, b = 0, i: number, f: number, p: number, q: number, t: number;

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
			case 0: r = v;
				g = t;
				b = p;
				break;
			case 1: r = q;
				g = v;
				b = p;
				break;
			case 2: r = p;
				g = v;
				b = t;
				break;
			case 3: r = p;
				g = q;
				b = v;
				break;
			case 4: r = t;
				g = p;
				b = v;
				break;
			case 5: r = v;
				g = p;
				b = q;
				break;
		}
		return ({r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255), a});
	}

	static HSVToXY(h: number, s: number, v: number, gamut?: Gamut)
	{
		const rgb = Color.HSVToRGB(h, s, v);

		return (Color.RGBToXY(rgb.r, rgb.g, rgb.b, gamut));
	}

	static HSLToRGB(h: number, s: number, l: number, a?: number)
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

		if (s === 0)
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

	static HSLToXY(h: number, s: number, l: number, gamut?: Gamut)
	{
		const rgb = Color.HSLToRGB(h, s, l);

		return (Color.RGBToXY(rgb.r, rgb.g, rgb.b, gamut));
	}

	static HEXToRGB(hex: string)
	{
		let result: RGBValue;
		let newHex: (number | undefined)[] | undefined;

		hex = hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])([a-f\d])?$/i, (m, r, g, b, a = "") => '#' + r + r + g + g + b + b + a + a);
		newHex = hex.match(STRING_PATTERN.HEX)?.map(x => (x !== undefined) ? parseInt(x, 16) : undefined);
		result = {r: newHex?.[1] ?? 0, g: newHex?.[2] ?? 0, b: newHex?.[3] ?? 0, a: 255};
		if (newHex?.[4] !== undefined)
			result.a = newHex[4];
		return (result);
	}

	static HEXToXY(hex: string, gamut?: Gamut)
	{
		const rgb = Color.HEXToRGB(hex);

		return (Color.RGBToXY(rgb.r, rgb.g, rgb.b, gamut));
	}

	static luminance(r: number, g: number, b: number, a?: number, lum = 0)
	{
		r = Math.round(Math.min(Math.max(0, r + (r * lum)), 255));
		g = Math.round(Math.min(Math.max(0, g + (g * lum)), 255));
		b = Math.round(Math.min(Math.max(0, b + (b * lum)), 255));
		return ({r, g, b, a} as RGBValue);
	}

	static compareXY(a?: XYValue, b?: XYValue)
	{
		return (a && b && a.x === b.x && a.y === b.y);
	}

	constructor(color: ColorValue, gamut?: Gamut)
	{
		this.set(color, gamut);
	}

	[Symbol.for('nodejs.util.inspect.custom')]()
	{
		return (this.hex());
		return (
		{
			xy: this.xy(),
			hex: this.hex(),
			rgb: this.rgb(),
			hsl: this.hsl()
		})
	}

	[Symbol.toPrimitive]()
	{return (this.toRGB())}

	/**
	 * Sets the color
	 */
	set(color: ColorValue, gamut?: Gamut)
	{
		let value: number[] | undefined;

		if (color instanceof Color)
			this._xy = {...color._xy};
		else if (isXY(color))
			this._xy = color;
		else if (isRGB(color))
			this._xy = Color.RGBToXY(color.r, color.g, color.b, gamut);
		else if (isHSV(color))
			this.setHSV(color, gamut);
		else if (isHSL(color))
			this.setHSL(color, gamut);
		else if (PRESET_COLOR[color?.toLowerCase?.()])
			this.setHEX(PRESET_COLOR[color?.toLowerCase?.()], gamut);
		else if (typeof color === "string" && STRING_PATTERN.HEX.test(color))
			this.setHEX(color, gamut);
		else if (typeof color === "string" && STRING_PATTERN.RGB.test(color))
		{
			value = color.match(STRING_PATTERN.RGB)?.map(x => parseInt(x));
			if (!value)
				return;
			this._xy = Color.RGBToXY(Math.round(value[1]), Math.round(value[2]), Math.round(value[3]), gamut);
		}
		else if (typeof color === "string" && STRING_PATTERN.HSV.test(color))
			this.setHSV(color, gamut);
		else if (typeof color === "string" && STRING_PATTERN.HSL.test(color))
			this.setHSL(color, gamut);
		else
			throw new ExtError("Color bad format");
	}

	xy()
	{return (this._xy)}

	hex()
	{return (Color.XYBriToHEX(this._xy.x, this._xy.y))}

	rgb()
	{
		const rgb = Color.XYBriToRGB(this._xy.x, this._xy.y);

		return (`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`);
	}

	toRGB()
	{return (Color.XYBriToRGB(this._xy.x, this._xy.y))}

	/**
	 * Sets color from HSV
	 */
	setHSV(hsv: HSVValue | string, gamut?: Gamut)
	{
		let tmp: number[] | undefined;

		if (isHSV(hsv))
			this._xy = Color.HSVToXY(hsv.h, hsv.s, hsv.v, gamut);
		else if (STRING_PATTERN.HSV.test(hsv))
		{
			tmp = hsv.match(STRING_PATTERN.HSV)?.map(x => parseInt(x));
			if (!tmp)
				return;
			this._xy = Color.HSVToXY(tmp[1], tmp[2], tmp[3], gamut);
		}
		else
			throw new ExtError("HSV bad format");
	}

	/**
	 * Sets color from HSL
	 */
	setHSL(hsl: HSLValue | string, gamut?: Gamut)
	{
		let tmp: number[] | undefined;

		if (isHSL(hsl))
			this._xy = Color.HSLToXY(hsl.h, hsl.s, hsl.l, gamut);
		else if (STRING_PATTERN.HSL.test(hsl))
		{
			tmp = hsl.match(STRING_PATTERN.HSL)?.map(x => parseInt(x));
			if (!tmp)
				return;
			this._xy = Color.HSLToXY(tmp[1], tmp[2], tmp[3], gamut);
		}
		else
			throw new ExtError("HSL bad format");
	}

	/**
	 * Sets the color from HEX
	 *
	 * @param {string} hex - The HEX value
	 */
	setHEX(hex: string, gamut?: Gamut)
	{
		if (STRING_PATTERN.HEX.test(hex))
			this._xy = Color.HEXToXY(hex, gamut);
		else
			throw new ExtError("HEX bad format");
	}

	hsv()
	{
		const rgb = Color.XYBriToRGB(this._xy.x, this._xy.y);

		return (Color.RGBtoHSV(rgb.r, rgb.g, rgb.b));
	}

	hsl()
	{
		const rgb = Color.XYBriToRGB(this._xy.x, this._xy.y);

		return (Color.RGBToHSL(rgb.r, rgb.g, rgb.b));
	}

	luminance(level = 0)
	{
		const rgb = Color.XYBriToRGB(this._xy.x, this._xy.y);

		return (new Color(Color.luminance(rgb.r, rgb.g, rgb.b, level)));
	}

	brightness(brightness = 100)
	{return (this.luminance(-((100 - Math.abs(brightness)) / 100)))}

	isLight()
	{
		const rgb = Color.XYBriToRGB(this._xy.x, this._xy.y);

		return ((((rgb.r * 299) + (rgb.g * 587) + (rgb.b * 114)) / 1000) >= 128)
	}

	isDark()
	{return (!this.isLight())}

	get x()
	{return (this._xy.x)}

	get y()
	{return (this._xy.y)}
}

