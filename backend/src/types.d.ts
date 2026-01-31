import type { ReqUser } from "@modules/auth/auth.types.js";

declare global {
	namespace Express {
		export interface Request {
			user?: ReqUser;
			token?: string;
			validatedQuery: Record<string, T>;
			validatedParams: Record<string, T>;
		}
	}
}
