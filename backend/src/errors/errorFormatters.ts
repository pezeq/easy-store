import type { AppError } from "./appErrors";

interface ErrorResponse {
	name: string;
	statusCode: number;
	message: string;
	timestamp: string;
}

interface ErrorLog extends ErrorResponse {
	isOperational?: boolean | undefined;
	stack?: string | undefined;
	type: string;
	code?: number | string | undefined;
}

export const formatErrorResponse = (err: AppError): ErrorResponse => ({
	name: err.name,
	statusCode: err.statusCode,
	message: err.message,
	timestamp: new Date().toISOString(),
});

export const formatErrorLog = (err: AppError): ErrorLog => ({
	name: err.name,
	statusCode: err.statusCode,
	message: err.message,
	stack: err.stack,
	isOperational: err.isOperational ? err.isOperational : false,
	type: err.constructor.name,
	code: err.code,
	timestamp: new Date().toISOString(),
});
