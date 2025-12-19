import bcrypt from "bcrypt";
import User, { type IUser } from "../models/userModel";
import { SALT_ROUND } from "../utils/config";

const getAll = (): Promise<IUser[]> => {
	return User.find({});
};

const getOne = (id: string): Promise<IUser | null> => {
	return User.findById({ _id: id });
};

const createNew = async (user: Partial<IUser>): Promise<IUser> => {
	const { name, username, email, password } = user;

	const passwordHash = await bcrypt.hash(password as string, SALT_ROUND);

	const newUser = new User({
		name,
		username,
		email,
		passwordHash,
	});

	return newUser.save();
};

const deleteOne = (id: string): Promise<IUser | null> => {
	return User.findByIdAndDelete({ _id: id });
};

const deleteAll = (): Promise<{
	acknowledged: boolean;
	deletedCount: number;
}> => {
	return User.deleteMany({});
};

export default {
	getAll,
	getOne,
	createNew,
	deleteOne,
	deleteAll,
};
