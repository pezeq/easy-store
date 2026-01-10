import type { NextFunction, Request, Response } from "express";
import type { AppError } from "../errors/appErrors.js";
import {
	formatErrorLog,
	formatErrorResponse,
} from "../errors/errorFormatters.js";
import { errorRewrapper } from "../errors/errorTranslator.js";

const errorHandler = (
	err: AppError,
	_req: Request,
	res: Response,
	_next: NextFunction
): void => {
	console.error(formatErrorLog(err));

	const appError = errorRewrapper(err);

	res.status(appError.statusCode).json(formatErrorResponse(appError));
};

export default errorHandler;
