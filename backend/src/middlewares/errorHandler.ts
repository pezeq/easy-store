import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { MongoServerError } from "mongodb";
import { MongooseError } from "mongoose";
import type { AppError } from "../errors/AppError";
import { formatErrorLog, formatErrorResponse } from "../errors/errorFormatters";

const errorHandler = (
	err: AppError,
	_req: Request,
	res: Response,
	_next: NextFunction
): void => {
	console.error(formatErrorLog(err));

	const operationalFlags = {
		isOperational: err.isOperational,
		isMongooseError: err instanceof MongooseError,
		isMongoDbError: err instanceof MongoServerError,
		isSyntaxError: err.name === "SyntaxError",
		isJsonWebTokenError: err instanceof jwt.JsonWebTokenError,
	};

	const isOperationalError = Object.values(operationalFlags).some(Boolean);

	if (isOperationalError) {
		const error = formatErrorResponse(err);
		res.status(error.statusCode).json(error);
	} else {
		res.status(500).json({
			message: "Ooops... Something went wrong!",
		});
	}
};

export default errorHandler;
