import type { NextFunction, Request, Response } from "express";
import type { z } from "zod";

const paramsValidation =
	(schema: z.ZodObject) =>
	(req: Request, _res: Response, next: NextFunction) => {
		const parsed = schema.parse(req.params);
		req.validatedParams = parsed;
		next();
	};

export default paramsValidation;
