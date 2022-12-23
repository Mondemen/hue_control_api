import ErrorCodes, {getMessage} from "./ErrorCodes.js";

export default class ExtError extends Error
{
	/**
	 * @param {number?} code - Error code
	 * @param {string} message - Error message
	 * @param {*} extra - Extra data
	 */
	constructor(code, message, extra)
	{
		if (typeof code == "string")
		{
			extra = message;
			message = code;
			code = ErrorCodes.unknown;
		}
		code ??= ErrorCodes.unknown;
		super(message ?? getMessage(code));
		this.code = code;
		this.extra = extra;
	}
}