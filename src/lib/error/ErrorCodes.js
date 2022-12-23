const ErrorCodes =
{
	unknown: -1,
	alreadyExists: 1,
	notExists: 2,
	arguments: 2,
	badAppKey: 10,
	badBridgeID: 11,
	notCreated: 12,
	badUUID: 13,
	badHourRange: 14,
	badMinuteRange: 15,
	badSecondRange: 16,
	http:
	{
		badRequest: 400,
		unauthorized: 401,
		forbidden: 403,
		notFound: 404,
		methodNotAllowed: 405,
		conflict: 409,
		tooManyRequests: 429,
		internalServerError: 500,
		serviceUnavailable: 503,
		insufficientStorage: 507
	}
}

export default ErrorCodes;

export function getMessage(code)
{
	switch (code)
	{
		case ErrorCodes.alreadyExists:              return ("Data already exists");
		case ErrorCodes.notExists:                  return ("Data not exists");
		case ErrorCodes.arguments:                  return ("Bad arguments");
		case ErrorCodes.badAppKey:                  return ("Bad API key");
		case ErrorCodes.badBridgeID:                return ("Bad bridge ID");
		case ErrorCodes.notCreated:                 return ("Resource not create due to error");
		case ErrorCodes.badUUID:                    return ("UUID does not match with accepted pattern (uuid v4)");
		case ErrorCodes.badHourRange:               return ("The hour must be between 0 and 23");
		case ErrorCodes.badMinuteRange:             return ("The minute must be between 0 and 59");
		case ErrorCodes.badSecondRange:             return ("The second must be between 0 and 59");
		case ErrorCodes.http.badRequest:            return ("Bad Request");
		case ErrorCodes.http.unauthorized:          return ("Unauthorized");
		case ErrorCodes.http.forbidden:             return ("Forbidden");
		case ErrorCodes.http.notFound:              return ("Not Found");
		case ErrorCodes.http.methodNotAllowed:      return ("Method Not Allowed");
		case ErrorCodes.http.conflict:              return ("Conflict");
		case ErrorCodes.http.tooManyRequests:       return ("Too Many Requests");
		case ErrorCodes.http.internalServerError:   return ("Internal Server Error");
		case ErrorCodes.http.serviceUnavailable:    return ("Service Unavailable");
		case ErrorCodes.http.insufficientStorage:   return ("Insufficient Storage");
		default:                                    return ("Unknown error");
	}
}