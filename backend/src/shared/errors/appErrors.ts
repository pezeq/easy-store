export class AppError extends Error {
	readonly statusCode: number;
	readonly isOperational: boolean;
	readonly code?: string | number | undefined;

	protected constructor(
		message: string,
		statusCode: number,
		code?: string | number
	) {
		super(message);

		this.name = this.constructor.name;
		this.statusCode = statusCode;
		this.code = code;
		this.isOperational = true;

		Error.captureStackTrace(this, this.constructor);
	}
}

export class NotFoundError extends AppError {
	constructor(message: string = "Resource was not found") {
		super(message, 404);
	}
}

export class ValidationError extends AppError {
	constructor(message: string = "Some of your input was invalid") {
		super(message, 400);
	}
}

export class AuthError extends AppError {
	constructor(message: string = "Invalid authentication credentials") {
		super(message, 401);
	}
}

export class DuplicateResourceError extends AppError {
	constructor(message: string = "Resource already exists") {
		super(message, 409);
	}
}

export class InternalServerError extends AppError {
	constructor(message: string = "Ooops... Something went wrong!") {
		super(message, 500);
	}
}
