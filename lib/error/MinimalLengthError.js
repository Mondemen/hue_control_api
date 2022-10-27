export default class MinimalLengthError extends Error
{
	constructor(object, method, target, name, min)
	{
		super(`${object.constructor.name}.${method}(): Need more then ${min} ${name} in the ${target}`);
	}
}