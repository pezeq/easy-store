import jwt from "jsonwebtoken";
import { NoResultError } from "kysely";
import { DatabaseError } from "pg";
import {
	AppError,
	AuthError,
	DuplicateResourceError,
	InternalServerError,
	NotFoundError,
	ValidationError,
} from "./appErrors.js";

const translatePostgresError = (err: DatabaseError): AppError => {
	const CONSTRAINT_COLUMN_MAP = {
		cart_items_quantity_check: "quantity",
		cart_items_total_price_check: "totalPrice",
		products_name_key: "name",
		products_name_check: "name",
		products_stock_quantity_check: "stockQuantity",
		products_price_check: "price",
		products_sku_check: "sku",
		products_sku_key: "sku",
		users_username_key: "username",
		users_username_check: "username",
		users_email_key: "email",
		users_email_check: "email",
		users_phone_number_check: "phoneNumber",
	};

	type ConstraintName = keyof typeof CONSTRAINT_COLUMN_MAP;

	const field = err.constraint
		? CONSTRAINT_COLUMN_MAP[err.constraint as ConstraintName]
		: "unknown";

	switch (err.code) {
		case "23505":
			return new DuplicateResourceError(
				`Field '${field}' already exists`
			);
		case "23514":
			return new ValidationError(`Field '${field}' is malformatted`);
		case "23502":
			return new ValidationError(`Field '${err.column}' is required`);
		default:
			return new ValidationError("Invalid database input");
	}
};

const translateJwtError = (
	err: jwt.JsonWebTokenError | jwt.TokenExpiredError
): AppError => {
	switch (err.name) {
		case "JsonWebTokenError":
			return new AuthError("Your request has a invalid token");
		case "TokenExpiredError":
			return new AuthError("Your token has been expired");
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
		case err instanceof NoResultError:
			return new NotFoundError();
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
