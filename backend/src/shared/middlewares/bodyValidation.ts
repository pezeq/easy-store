import type { NextFunction, Request, Response } from "express";
import type { z } from "zod";

const bodyValidation =
	(schema: z.ZodObject) =>
	(req: Request, _res: Response, next: NextFunction) => {
		schema.parse(req.body);
		next();
	};

export default bodyValidation;
