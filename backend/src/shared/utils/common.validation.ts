import { z } from "zod";

export const idSchema = z.object({
	id: z.coerce
		.number<number>("Params ID must be a number")
		.int("Params ID must be an integer")
		.positive("Params ID must be greater than 0"),
});

export type idSchemaType = z.infer<typeof idSchema>;

export const paginationSchema = z.object({
	limit: z.coerce
		.number<number>("Limit must be a number")
		.int("Limit must be an integer")
		.positive("Limit must be greater than 0")
		.max(20, "Limit maximum value is 20")
		.default(20),
	offset: z.coerce
		.number<number>("Offset must be a number")
		.int("Offset must be an integer")
		.min(0, "Offset must be greater than 0")
		.default(0),
});

export type paginationSchemaType = z.infer<typeof paginationSchema>;
