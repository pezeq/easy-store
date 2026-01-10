import { NotFoundError, ValidationError } from "@shared/errors/appErrors.js";
import {
	createNewProduct,
	deleteAllProducts,
	deleteProductById,
	findAllProducts,
	findProductById,
	getProductStockAndPrice,
	updateProductStock,
} from "./product.repository.js";
import type { NewProduct, ProductDTO } from "./product.types.js";

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

const updateQuantity = async (
	id: number,
	quantity: number
): Promise<ProductDTO> => {
	const { stockQuantity } = await getProductStockAndPrice(id);

	if (0 > stockQuantity + quantity) {
		throw new ValidationError("Product quantity can not be negative");
	}

	const updatedProduct = await updateProductStock(id, quantity);

	if (!updatedProduct)
		throw new NotFoundError(`Product with id ${id} was not found!`);

	return updatedProduct;
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
	updateQuantity,
	deleteOne,
	deleteAll,
};
