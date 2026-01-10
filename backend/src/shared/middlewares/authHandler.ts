import { fetchReqUser } from "@modules/auth/auth.repository.js";
import type { ReqUser } from "@modules/auth/auth.types.js";
import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { SECRET } from "../config/config.js";
import { AuthError, NotFoundError } from "../errors/appErrors.js";

const userHasAuth = (token: string): JwtPayload => {
	return jwt.verify(token, SECRET) as JwtPayload;
};

const tokenExtractor = (req: Request): void => {
	const auth: string | undefined = req.get("Authorization");

	if (auth?.startsWith("Bearer ")) {
		req.token = auth.replace("Bearer ", "");
	}
};

const authHandler = async (
	req: Request,
	_res: Response,
	next: NextFunction
): Promise<void> => {
	tokenExtractor(req);

	const decoded = await userHasAuth(req.token as string);

	if (!decoded.id) throw new AuthError("Your request has a invalid token");

	const user: ReqUser = await fetchReqUser(decoded.id);

	if (!user) throw new NotFoundError("User does not exist");

	req.user = user;

	next();
};

export default authHandler;
