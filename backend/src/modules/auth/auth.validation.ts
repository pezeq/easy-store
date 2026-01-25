import { z } from "zod";

export const loginSchema = z.object({
	username: z.string().min(1).trim(),
	password: z.string().min(1),
});

export const signupSchema = z.object({
	username: z
		.string()
		.min(3, "Username must be at least 3 characters")
		.max(16, "Username must be at most 16 characters")
		.regex(
			/^[a-zA-Z0-9_]+$/,
			"Username can only contain letters, numbers and underscores"
		)
		.trim(),
	password: z
		.string()
		.min(8, "Password must be at least 8 characters")
		.regex(/[A-Z]/, "Password must contain at least one uppercase letter")
		.regex(/[a-z]/, "Password must contain at least one lowercase letter")
		.regex(/[0-9]/, "Password must contain at least one number")
		.regex(
			/[^A-Za-z0-9]/,
			"Password must contain at least one special character"
		),
	name: z.string().min(1, "Name is required").trim(),
	email: z.email("Invalid email format"),
	phoneNumber: z.string().min(1).optional(),
});
