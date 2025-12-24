import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import User, { type IUser } from "../models/userModel";
import { SECRET } from "../utils/config";

const userHasAuth = (token: string): JwtPayload => {
	return jwt.verify(token, SECRET) as JwtPayload;
};

const userExtractor = async (
	req: Request,
	_res: Response,
	next: NextFunction
): Promise<void> => {
	const decoded = await userHasAuth(req.token as string);

	if (!decoded.id) throw new Error("User has no id");

	const user: IUser | null = await User.findById({ _id: decoded.id });

	if (!user) throw new Error("User doesnt exist");

	req.user = user;

	next();
};

export default userExtractor;
