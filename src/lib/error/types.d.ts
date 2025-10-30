export type LogLevel = "info" | "warn" | "error" | "debug";

export interface ExtErrorResponse<D = any> extends D
{
	code: number;
	status: number;
	message: string;
	details?: string | undefined;
}
