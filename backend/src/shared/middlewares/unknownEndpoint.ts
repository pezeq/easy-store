import type { NextFunction, Request, Response } from "express";
import { NotFoundError } from "../errors/appErrors.js";

const unknownEndpoint = (
	req: Request,
	_res: Response,
	next: NextFunction
): void => {
	next(
		new NotFoundError(
			`The route '${req.method} ${req.path}' was not found!`
		)
	);
};

export default unknownEndpoint;
