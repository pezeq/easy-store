import {
	createNewProduct,
	deleteAllProducts,
	deleteProductById,
	findAllProducts,
	findProductById,
} from "./product.repository";
import type { NewProduct, ProductDTO } from "./product.types";

const getAll = (): Promise<ProductDTO[]> => {
	return findAllProducts();
};

const getOne = (id: number): Promise<ProductDTO> => {
	return findProductById(id);
};

const createNew = ({
	name,
	sku,
	description,
	price,
	stockQuantity,
	brandId,
}: NewProduct): Promise<ProductDTO> => {
	const newProduct = createNewProduct({
		name,
		sku,
		description,
		price,
		stock_quantity: stockQuantity,
		brand_id: brandId,
	});

	return newProduct;
};

const deleteOne = async (id: number): Promise<void> => {
	await deleteProductById(id);
};

const deleteAll = async (): Promise<void> => {
	await deleteAllProducts();
};

export default {
	getAll,
	getOne,
	createNew,
	deleteOne,
	deleteAll,
};
