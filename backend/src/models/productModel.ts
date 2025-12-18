import mongoose, { type Document, Schema } from "mongoose";

export interface IProduct {
	id?: string;
	_id?: mongoose.Types.ObjectId;
	__v?: number;
	name: string;
	category?: string;
	description: string;
	price: number;
	stockQuantity: number;
	priceLog?: PriceLog[];
	weight?: number;
	size?: number;
	createdAt: Date;
	updatedAt: Date;
	modifiedLastBy?: string;
}

export type PriceLog = {
	oldPrice: number;
	newPrice: number;
	updatedAt: number;
};

const productSchema: Schema<IProduct> = new Schema({
	name: {
		type: String,
		unique: true,
		required: [true, "Product must have a name"],
		lowercase: true,
		trim: true,
		minLength: [3, "Name must be at least 3 characters long"],
		maxLength: [64, "Name must be at most 64 characters long"],
	},
	category: {
		type: String,
		lowercase: true,
		trim: true,
		minLength: [3, "Category must be at least 3 characters long"],
		maxLength: [32, "Category must be at most 32 characters long"],
	},
	description: {
		type: String,
		required: [true, "Product must have a description"],
		lowercase: true,
		trim: true,
		minLength: [3, "Name must be at least 3 characters long"],
		maxLength: [64, "Name must be at most 64 characters long"],
	},
	price: {
		type: Number,
		required: [true, "Product must have a price"],
		min: [1, "Price must be greater than zero"],
	},
	stockQuantity: {
		type: Number,
		required: [true, "Product must have a stock quantity"],
		min: [0, "Stock quantity cannot be negative"],
	},
	priceLog: [
		{
			oldPrice: Number,
			newPrice: Number,
			updatedAt: Number,
		},
	],
	weight: {
		type: Number,
		min: [0, "Weight cannot be negative"],
	},
	size: {
		type: Number,
		min: [0, "Size cannot be negative"],
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	updatedAt: {
		type: Date,
		default: Date.now,
	},
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
