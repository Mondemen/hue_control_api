import ExtError from "./ExtError.js";
import ErrorCodes from "./ErrorCodes.js";

export default class ArgumentError extends ExtError
{
	constructor(object, method, name, value, type, typeName)
	{
		super(ErrorCodes.arguments, `${object?.constructor?.name}::${method}(): The "${name}" value accepts "${typeName ?? type?.map?.(type => type.name ?? type) ?? type.name ?? type?.map?.(type => type.constructor.name) ?? type.constructor.name}", not "${typeof value}" (${JSON.stringify(value)})`);
		this.name = "ArgumentError";
	}
}