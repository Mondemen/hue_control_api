import ArgumentError from "../lib/error/ArgumentError.js";

export function checkParam(object, method, name, value, type, typeName)
{
	if (type.constructor instanceof Object && Object.values(type).includes(value))
		return;
	if (type instanceof Function && value instanceof type)
		return;
	if (typeof  type == "string" && typeof value == type)
		return;
	throw new ArgumentError(object, method, name, value, type, typeName);
}
