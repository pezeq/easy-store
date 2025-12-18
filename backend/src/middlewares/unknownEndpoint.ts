import type { NextFunction, Request, Response } from "express";
import { NotFoundError } from "../errors/AppError";

const unknownEndpoint = (
	req: Request,
	_res: Response,
	next: NextFunction
): void => {
	next(new NotFoundError(`The endpoint '${req.originalUrl}' was not found!`));
};

export default unknownEndpoint;
