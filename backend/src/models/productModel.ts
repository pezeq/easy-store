import mongoose, { type Document, Schema } from "mongoose";

export interface IProduct {
	id?: string;
	_id?: mongoose.Types.ObjectId;
	__v?: number;
	name: string;
	category: string;
	description: string;
	weight: number;
	size: number;
	price: number;
	stockQuantity: number;
	priceLog: PriceLog[];
	createdAt: Date;
	updatedAt: Date;
	modifiedLastBy: string;
}

export type PriceLog = {
	oldPrice: number;
	newPrice: number;
	updatedAt: number;
};

const productSchema: Schema<IProduct> = new Schema({
	name: String,
	category: String,
	description: String,
	weight: Number,
	size: Number,
	price: Number,
	stockQuantity: Number,
	priceLog: [
		{
			oldPrice: Number,
			newPrice: Number,
			updatedAt: Number,
		},
	],
	createdAt: Date,
	updatedAt: Date,
	modifiedLastBy: String,
});

productSchema.set("toJSON", {
	transform: (_doc: Document, ret: IProduct) => {
		if (ret._id) ret.id = ret._id.toString();
		delete ret._id;
		delete ret.__v;
		return ret;
	},
});

export default mongoose.model("Product", productSchema);
