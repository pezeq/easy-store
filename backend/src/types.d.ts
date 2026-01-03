import type { UserDTO } from "./types/userTypes";

declare global {
	namespace Express {
		export interface Request {
			user?: UserDTO;
			token?: string;
		}
	}
}
