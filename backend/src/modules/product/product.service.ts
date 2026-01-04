import type { UpdateResult } from "kysely";
import type { InsertProduct } from "../../shared/types/kysely.types";
import {
	deleteAllProducts,
	deleteProductById,
	findAllProducts,
	findProductById,
	insertProduct,
} from "./product.repository";
import type { ProductDTO } from "./product.types";

const getAll = (): Promise<ProductDTO[]> => {
	return findAllProducts();
};

const getOne = (id: string): Promise<ProductDTO> => {
	return findProductById(id);
};

const createNew = (product: InsertProduct): Promise<ProductDTO> => {
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
