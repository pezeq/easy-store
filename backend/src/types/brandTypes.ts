import type { Generated, Insertable, Selectable, Updateable } from "kysely";

export interface BrandsTable {
	id: Generated<string>;
	name: string;
	created_at: Generated<Date>;
	updated_at: Generated<Date>;
	deleted_at: Date | null;
}

export type Brand = Selectable<BrandsTable>;
export type NewBrand = Insertable<BrandsTable>;
export type BrandUpdate = Updateable<BrandsTable>;
