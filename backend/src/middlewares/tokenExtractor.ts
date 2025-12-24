import type { NextFunction, Request, Response } from "express";

const tokenExtractor = (
	req: Request,
	_res: Response,
	next: NextFunction
): void => {
	const auth: string | undefined = req.get("Authorization");

	if (auth?.startsWith("Bearer ")) {
		req.token = auth.replace("Bearer ", "");
	}

	next();
};

export default tokenExtractor;
