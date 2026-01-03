import type { BrandsTable } from "./brandTypes";
import type { ProductsTable } from "./productTypes";
import type { UsersTable } from "./userTypes";

export interface Database {
	users: UsersTable;
	products: ProductsTable;
	brands: BrandsTable;
}
