import type { NextFunction, Request, Response } from "express";

const requestLogger = (
	req: Request,
	_res: Response,
	next: NextFunction
): void => {
	const bodyHasPassword = req.body?.password;

	if (bodyHasPassword) {
		const { password, ...partialBody } = req.body;

		console.log("---");
		console.log("METHOD:\t", req.method);
		console.log("PATH:\t", req.path);
		console.log("BODY:\t", partialBody);
		console.log("---");
	} else {
		console.log("---");
		console.log("METHOD:\t", req.method);
		console.log("PATH:\t", req.path);
		console.log("BODY:\t", req.body);
		console.log("---");
	}

	next();
};

export default requestLogger;
