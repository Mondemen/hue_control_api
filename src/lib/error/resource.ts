import ExtError from ".";
import Resource from "../../api/Resource";

export default class ResourceError<D extends string | Record<string, any> = string> extends ExtError
{
	resource?: Resource;

	constructor(code: number, details?: string | D, resource?: Resource, status?: number);
	constructor(details: string | D);
	constructor(error: Error);
	constructor(code: number | string | D | Error, details?: string | D, resource?: Resource, status?: number)
	{
		super(code as any, details as any, status);
		this.resource = resource;
	}
}
