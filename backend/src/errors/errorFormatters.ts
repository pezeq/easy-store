import { MongooseError } from "mongoose";
import { DatabaseError } from "pg";
import type { AppError } from "../errors/AppError";

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
	code: number | string | undefined;
}

export const formatErrorLog = (err: AppError): ErrorLog => {
	return {
		name: err.name,
		message: err.message,
		statusCode: err.statusCode,
		isOperational: err.isOperational ? err.isOperational : false,
		stack: err.stack,
		type: err.constructor.name,
		code: err.code,
		timestamp: new Date().toISOString(),
	};
};

export const formatErrorResponse = (err: AppError): ErrorResponse => {
	const fallbackError = {
		name: "UnexpectedError",
		message: "Something went wrong",
	};

	const mapErrorStatus = (err: AppError): number => {
		switch (err.name) {
			case "CastError":
			case "MongoServerError":
			case "ValidationError":
			case "error":
				return 400;
			case "JsonWebTokenError":
			case "TokenExpiredError":
				return 401;
			default:
				return 500;
		}
	};

	const mapErrorMsg = (err: AppError): string | undefined => {
		switch (err.name) {
			case "CastError":
				return `Invalid ${err.path}: ${err.value}.`;
			case "MongoServerError": {
				const DUPLICATE_REGEX =
					/dup key:\s*\{\s*(\w+)\s*:\s*"([^"]+)"\s*\}/i;
				const duplicateError = err.message.match(DUPLICATE_REGEX);

				if (duplicateError) {
					const field = duplicateError[1];
					const value = duplicateError[2];
					return `Field '${field}' already exists with value '${value}'`;
				}

				return;
			}
			case "ValidationError": {
				const VALIDATION_REGEX = /\b\w+: ([^,]+)(?=,|$)/g;
				const validationError = [
					...err.message.matchAll(VALIDATION_REGEX),
				].map((match) => match[1]);

				if (err instanceof MongooseError && validationError) {
					return `${validationError.length} invalid inputs: ${validationError.join(", ").replace(/\b\w+:\s*/g, "")}`;
				}

				return;
			}
			case "JsonWebTokenError":
				return "Your request has a invalid token";
			case "TokenExpiredError":
				return "Your token has been expired";
			case "error": {
				if (!(err instanceof DatabaseError)) {
					return fallbackError.message;
				}

				const parts = err.constraint?.split("_");

				if (!parts) return fallbackError.message;

				const message = {
					"23505": `Field '${parts[1]}' must be unique`,
					"23514": `Field '${parts[1]}' is malformated`,
				};

				const { code } = err;

				return message[code as keyof typeof code];
			}
			default:
				return;
		}
	};

	const mapErrorName = (err: AppError): string | undefined => {
		switch (err.name) {
			case "error": {
				if (!(err instanceof DatabaseError)) {
					return fallbackError.name;
				}

				return "ValidationError";
			}
			default:
				return;
		}
	};

	const name = mapErrorName(err) ?? err.name ?? fallbackError.name;
	const statusCode = err.statusCode ?? mapErrorStatus(err);
	const message = mapErrorMsg(err) ?? err.message ?? fallbackError.message;

	return {
		name,
		statusCode,
		message,
		timestamp: new Date().toISOString(),
	};
};
