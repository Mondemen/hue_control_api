import ArgumentError from "../lib/error/ArgumentError.js";

export function checkParam(object, method, name, value, typeList, typeNameList)
{
	let error = true;
	let typeName;

	if (!Array.isArray(typeList))
		typeList = [typeList];
	if (!Array.isArray(typeNameList))
		typeNameList = [typeNameList];
	typeList.forEach((type, i) =>
	{
		typeName = typeNameList[i];
		if (type.constructor instanceof Object && Object.values(type).includes(value))
			error = false;
		else if (type instanceof Function && value instanceof type)
			error = false;
		else if (typeof type == "string" && typeof value == type)
			error = false;
	})
	if (error)
		throw new ArgumentError(object, method, name, value, typeList, typeNameList);
}
