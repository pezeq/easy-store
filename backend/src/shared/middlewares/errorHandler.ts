import type { NextFunction, Request, Response } from "express";
import type { AppError } from "../errors/appErrors";
import { formatErrorLog, formatErrorResponse } from "../errors/errorFormatters";
import { errorRewrapper } from "../errors/errorTranslator";

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
