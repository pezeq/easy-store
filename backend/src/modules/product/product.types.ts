export interface ProductDTO {
	id: string;
	name: string;
	sku: string;
	description?: string | null;
	price: number;
	stockQuantity: number;
	size?: string | null;
	weight?: number | null;
	brandId: string;
	costPrice?: number | null;
	createdAt: Date;
	updateAt?: Date;
	deletedAt?: Date | null;
}
