export enum UserRole {
	CUSTOMER = "customer",
	SELLER = "seller",
	ADMIN = "admin",
}

export enum SalesChannel {
	ONLINE = "online",
	INSTORE = "in_store",
}

export enum OrderStatus {
	CREATED = "created",
	PROCESSING = "processing",
	PENDING = "pending",
	PAID = "paid",
	COMPLETED = "completed",
	CANCELED = "canceled",
	REFUNDED = "refunded",
}

export interface Pagination<T> {
	data: Array<T>;
	meta: {
		page: number;
		pageSize: number;
		totalItems: number;
		totalPages: number;
	};
}
