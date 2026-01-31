import type { Pagination } from "@shared/types/custom.types.js";

export const paginationFormatter = <T>(
	data: Array<T>,
	count: string | number | bigint,
	limit: number,
	offset: number
): Pagination<T> => {
	const totalItems = Number(count);
	const pageSize = limit;
	const totalPages = Math.max(Math.ceil(totalItems / limit), 1);
	const page = Math.floor(offset / limit) + 1;

	return {
		data,
		meta: {
			page,
			pageSize,
			totalItems,
			totalPages,
		},
	};
};
