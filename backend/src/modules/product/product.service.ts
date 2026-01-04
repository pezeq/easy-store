import type { UpdateResult } from "kysely";
import {
	deleteAllProducts,
	deleteProductById,
	findAllProducts,
	findProductById,
	insertProduct,
} from "../../repositories/productRepository";
import type { NewProduct, ProductDTO } from "../../types/productTypes";

const getAll = (): Promise<ProductDTO[]> => {
	return findAllProducts();
};

const getOne = (id: string): Promise<ProductDTO> => {
	return findProductById(id);
};

const createNew = (product: NewProduct): Promise<ProductDTO> => {
	const newProduct = insertProduct({
		...product,
	});

	return newProduct;
};

const deleteOne = (id: string): Promise<UpdateResult> => {
	return deleteProductById(id);
};

const deleteAll = (): Promise<UpdateResult> => {
	return deleteAllProducts();
};

export default {
	getAll,
	getOne,
	createNew,
	deleteOne,
	deleteAll,
};
