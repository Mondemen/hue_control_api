import Statuses from "statuses";
import { ExtErrorResponse, LogLevel } from "./types";

const CodeMessage = {};
const CodeStatus = {};
const CodeLogLevel = {};

export default class ExtError<D extends string | Record<string, any> = string> extends Error
{
	code: number;
	status: number;
	statusMessage: string | undefined;
	details: string | D | undefined;
	level: LogLevel;

	constructor(code: number, details?: string | D, status?: number);
	constructor(details: string | D);
	constructor(error: Error);
	constructor(code: number | string | D | Error, details?: string | D, status?: number)
	{
		let heritedStack: string | undefined;

		super();
		if (code instanceof Error)
		{
			heritedStack = code.stack;
			if (code instanceof ExtError)
			{
				details = code.details;
				code = code.code;
			}
			else
			{
				details = code.message;
				code = -1;
			}
		}
		else if ((typeof code === "string" || typeof code === "object") && typeof code !== "number")
		{
			details = code;
			code = -1;
		}
		if (Error.captureStackTrace)
			Error.captureStackTrace(this, this.constructor);
		this.code = CodeMessage[code as number] ? code as number : -1;
		this.status = status ?? CodeStatus[this.code] ?? 500;
		this.statusMessage = Statuses.message[this.status];
		this.message = CodeMessage[this.code];
		this.details = details;
		this.level = CodeLogLevel[this.code] ?? "error";
		this.stack = heritedStack ?? this.stack;
	}

	toObject(): ExtErrorResponse<D>
	{
		if (typeof this.details === "string")
		{
			return (
			{
				code: this.code,
				status: this.status,
				message: this.message,
				details: this.details
			});
		}
		return (
		{
			code: this.code,
			status: this.status,
			message: this.message,
			...this.details
		});
	}

	toString()
	{return (JSON.stringify(this.toJSON()))}

	toJSON()
	{return (this.toObject())}

	toHTTP<C = any>(customData?: C): ExtErrorResponse<C>
	{
		return (
		{
			...this.toObject(),
			...customData
		});
	}

	static addCustomCode(code: number, message: string, level?: LogLevel, statusCode?: number): void;
	static addCustomCode(code: number[], message: string, level?: LogLevel, statusCode?: number): void;
	static addCustomCode(code: number | number[], message: string, level?: LogLevel, statusCode?: number)
	{
		code = !Array.isArray(code) ? [code] : code;
		code.forEach((code =>
		{
			CodeMessage[code] = message;
			if (statusCode !== undefined)
				CodeStatus[code] = statusCode;
			CodeLogLevel[code] = level ?? "error";
		}));
	}
}

ExtError.addCustomCode(1, "Data already exists");
ExtError.addCustomCode(2, "Data not exists");
ExtError.addCustomCode(2, "Bad arguments", "debug");
ExtError.addCustomCode(10, "Bad API key");
ExtError.addCustomCode(11, "Bad bridge ID");
ExtError.addCustomCode(12, "Resource not create due to error");
ExtError.addCustomCode(13, "UUID does not match with accepted pattern (uuid v4)");
ExtError.addCustomCode(14, "The hour must be between 0 and 23");
ExtError.addCustomCode(15, "The minute must be between 0 and 59");
ExtError.addCustomCode(16, "The second must be between 0 and 59");

ExtError.addCustomCode(100, "POST resource");
ExtError.addCustomCode(101, "GET resource");
ExtError.addCustomCode(102, "PUT resource");
ExtError.addCustomCode(103, "DELETE resource");
