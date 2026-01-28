import type { ReqUser } from "@modules/auth/auth.types";

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
