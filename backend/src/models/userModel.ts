import mongoose, { type Document, Schema } from "mongoose";

export interface IUser {
	id?: string;
	_id?: mongoose.Types.ObjectId;
	__v?: number;
	name: string;
	username: string;
	passwordHash?: string;
	password: string;
	email: string;
	role: UserRole;
	createdAt: Date;
	updatedAt: Date;
	status: UserStatus;
}

export enum UserRole {
	Admin = "admin",
	Employee = "employee",
	Customer = "customer",
}

export enum UserStatus {
	Active = "active",
	Inactive = "inactive",
}

const userSchema: Schema<IUser> = new Schema({
	name: {
		type: String,
		required: [true, "User must have a name"],
		trim: true,
		minLength: [3, "Name must be at least 3 characters long"],
		maxLength: [64, "Name must be at most 64 characters long"],
	},
	username: {
		type: String,
		unique: true,
		required: [true, "User must have a username"],
		trim: true,
		minLength: [3, "Username must be at least 3 characters long"],
		maxLength: [24, "Username must be at most 24 characters long"],
	},
	passwordHash: {
		type: String,
		required: [true, "User must have a password"],
	},
	email: {
		type: String,
		unique: true,
		required: [true, "User must have a email"],
		minLength: [5, "Email must be at least 5 characters long"],
		maxLength: [254, "Email must be at most 254 characters long"],
	},
	role: {
		type: String,
		default: UserRole.Customer,
		enum: UserRole,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	updatedAt: {
		type: Date,
		default: Date.now,
	},
	status: {
		type: String,
		default: UserStatus.Active,
		enum: UserStatus,
	},
});

userSchema.set("toJSON", {
	transform: (_doc: Document, ret: IUser) => {
		if (ret._id) ret.id = ret._id?.toString();
		delete ret._id;
		delete ret.__v;
		delete ret.passwordHash;
		return ret;
	},
});

export default mongoose.model("User", userSchema);
