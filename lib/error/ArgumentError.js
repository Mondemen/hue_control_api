export default class ArgumentError extends Error
{
	constructor(object, method, name, value, type, typeName)
	{
		super(`${object.constructor.name}.${method}(): The "${name}" value accepts "${typeName ?? type?.map?.(type => type.name ?? type) ?? type.name ?? type?.map?.(type => type.constructor.name) ?? type.constructor.name}", not "${typeof value}" (${JSON.stringify(value)})`);
	}
}