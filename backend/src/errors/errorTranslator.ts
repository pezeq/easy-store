import jwt from "jsonwebtoken";
import { DatabaseError } from "pg";
import {
	AppError,
	AuthenticationError,
	DuplicateResourceError,
	InternalServerError,
	ValidationError,
} from "./appErrors";

export const translatePostgresError = (err: DatabaseError): AppError => {
	const field = err.constraint?.split("_")[1];

	switch (err.code) {
		case "23505":
			return new DuplicateResourceError(
				`Field '${field}' already exists`
			);
		case "23514":
			return new ValidationError(`Field '${field}' is malformatted`);
		default:
			return new ValidationError("Invalid database input");
	}
};

export const translateJwtError = (
	err: jwt.JsonWebTokenError | jwt.TokenExpiredError
): AppError => {
	switch (err.name) {
		case "JsonWebTokenError":
			return new AuthenticationError("Your request has a invalid token");
		case "TokenExpiredError":
			return new AuthenticationError("Your token has been expired");
		default:
			return new InternalServerError();
	}
};

export const errorRewrapper = (err: unknown): AppError => {
	switch (true) {
		case err instanceof AppError:
			return err as AppError;
		case err instanceof DatabaseError:
			return translatePostgresError(err as DatabaseError);
		case err instanceof jwt.JsonWebTokenError:
		case err instanceof jwt.TokenExpiredError:
			return translateJwtError(
				err as jwt.JsonWebTokenError | jwt.TokenExpiredError
			);
		case err instanceof SyntaxError:
			return new ValidationError("Invalid JSON payload");
		default:
			return new InternalServerError();
	}
};
