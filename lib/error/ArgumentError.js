export default class ArgumentError extends Error
{
	constructor(object, method, name, value, type, typeName)
	{
		super(`${object.constructor.name}.${method}(): The "${name}" value accepts "${typeName ?? type.name ?? type.constructor.name}", not "${typeof value}"`);
	}
}