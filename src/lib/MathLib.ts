export default class MathLib
{
    /** The mathematical constant e. This is Euler's number, the base of natural logarithms. */
    static readonly E = Math.E;
    /** The natural logarithm of 10. */
    static readonly LN10 = Math.LN10;
    /** The natural logarithm of 2. */
    static readonly LN2 = Math.LN2;
    /** The base-2 logarithm of e. */
    static readonly LOG2E = Math.LOG2E;
    /** The base-10 logarithm of e. */
    static readonly LOG10E = Math.LOG10E;
    /** Pi. This is the ratio of the circumference of a circle to its diameter. */
    static readonly PI = Math.PI;
    /** The square root of 0.5, or, equivalently, one divided by the square root of 2. */
    static readonly SQRT1_2 = Math.SQRT1_2;
    /** The square root of 2. */
    static readonly SQRT2 = Math.SQRT2;
    /**
     * Returns the absolute value of a number (the value without regard to whether it is positive or negative).
     * For example, the absolute value of -5 is the same as the absolute value of 5.
     * @param x A numeric expression for which the absolute value is needed.
     */
    static abs(x: number)
	{return (Math.abs(x))}
    /**
     * Returns the arc cosine (or inverse cosine) of a number.
     * @param x A numeric expression.
     */
    static acos(x: number)
	{return (Math.acos(x))}
    /**
     * Returns the arcsine of a number.
     * @param x A numeric expression.
     */
    static asin(x: number)
	{return (Math.asin(x))}
    /**
     * Returns the arctangent of a number.
     * @param x A numeric expression for which the arctangent is needed.
     */
    static atan(x: number)
	{return (Math.atan(x))}
    /**
     * Returns the angle (in radians) from the X axis to a point.
     * @param y A numeric expression representing the cartesian y-coordinate.
     * @param x A numeric expression representing the cartesian x-coordinate.
     */
    static atan2(y: number, x: number)
	{return (Math.atan2(x, y))}
    /**
     * Returns the smallest integer greater than or equal to its numeric argument.
     * @param x A numeric expression.
     */
    static ceil(x: number)
	{return (Math.ceil(x))}
    /**
     * Returns the cosine of a number.
     * @param x A numeric expression that contains an angle measured in radians.
     */
    static cos(x: number)
	{return (Math.cos(x))}
    /**
     * Returns e (the base of natural logarithms) raised to a power.
     * @param x A numeric expression representing the power of e.
     */
    static exp(x: number)
	{return (Math.exp(x))}
    /**
     * Returns the greatest integer less than or equal to its numeric argument.
     * @param x A numeric expression.
     */
    static floor(x: number)
	{return (Math.floor(x))}
    /**
     * Returns the natural logarithm (base e) of a number.
     * @param x A numeric expression.
     */
    static log(x: number)
	{return (Math.log(x))}
    /**
     * Returns the larger of a set of supplied numeric expressions.
     * @param values Numeric expressions to be evaluated.
     */
    static max(...values: number[])
	{return (Math.max(...values))}
    /**
     * Returns the smaller of a set of supplied numeric expressions.
     * @param values Numeric expressions to be evaluated.
     */
    static min(...values: number[])
	{return (Math.min(...values))}
    /**
     * Returns the value of a base expression taken to a specified power.
     * @param x The base value of the expression.
     * @param y The exponent value of the expression.
     */
    static pow(x: number, y: number)
	{return (Math.pow(x, y))}
    /** Returns a pseudorandom number between 0 and 1. */
    static random()
	{return (Math.random())}
    /**
     * Returns a supplied numeric expression rounded to the nearest integer.
     * @param x The value to be rounded to the nearest integer.
     */
    static round(x: number)
	{return (Math.round(x))}
    /**
     * Returns the sine of a number.
     * @param x A numeric expression that contains an angle measured in radians.
     */
    static sin(x: number)
	{return (Math.sin(x))}
    /**
     * Returns the square root of a number.
     * @param x A numeric expression.
     */
    static sqrt(x: number)
	{return (Math.sqrt(x))}
    /**
     * Returns the tangent of a number.
     * @param x A numeric expression that contains an angle measured in radians.
     */
    static tan(x: number)
	{return (Math.tan(x))}

	static map(value: number, fromLow: number, fromHigh: number, toLow: number, toHigh: number)
	{return (toLow + (toHigh - toLow) * (value - fromLow) / (fromHigh - fromLow))}

	seed: number;

	constructor(seed?: number)
	{
		if (seed !== undefined && seed >= 0 && seed <= 1)
			seed *= 0xFFFF;
		this.seed = seed ?? (Math.random() * 0xFFFF);
	}

	random()
	{
		let t: number;

		this.seed |= 0;
		this.seed = this.seed + 0x9e3779b9 | 0;
		t = this.seed ^ this.seed >>> 16;
		t = Math.imul(t, 0x21f0aaad);
		t = t ^ t >>> 15;
		t = Math.imul(t, 0x735a2d97);
		return ((t = t ^ t >>> 15) >>> 0) / 4294967296;
	}
}
