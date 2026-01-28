import type { NextFunction, Request, Response } from "express";
import type { z } from "zod";

const queryValidation =
	(schema: z.ZodObject) =>
	(req: Request, _res: Response, next: NextFunction) => {
		const parsed = schema.parse(req.query);
		req.validatedQuery = parsed;
		next();
	};

export default queryValidation;
