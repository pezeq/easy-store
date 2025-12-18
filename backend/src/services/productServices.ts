import Product, { type IProduct } from "../models/productModel";

const getAll = (): Promise<IProduct[]> => {
	return Product.find({});
};

const getOne = (id: string): Promise<IProduct | null> => {
	return Product.findById(id);
};

const createNew = (product: Partial<IProduct>): Promise<IProduct> => {
	const newProduct = new Product({
		...product,
	});

	return newProduct.save();
};

const deleteOne = (id: string): Promise<IProduct | null> => {
	return Product.findByIdAndDelete(id);
};

const deleteAll = (): Promise<{
	acknowledged?: boolean;
	deletedCount?: number;
}> => {
	return Product.deleteMany({});
};

export default {
	getAll,
	getOne,
	createNew,
	deleteOne,
	deleteAll,
};
