// biome-ignore-all lint/suspicious/noExplicitAny: kysely needs any here

import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
	await sql`
        CREATE TYPE user_role AS ENUM ('customer', 'seller', 'admin')
    `.execute(db);
	await sql`
        CREATE TYPE sales_channel AS ENUM ('online', 'in_store')
    `.execute(db);
	await sql`
        CREATE TYPE order_status AS ENUM ('pending', 'processing', 'paid', 'completed', 'canceled', 'refunded')
    `.execute(db);
	await sql`
        CREATE TYPE payment_status AS ENUM ('pending', 'ongoing', 'completed', 'failed', 'refunded')
    `.execute(db);
	await sql`
        CREATE TYPE delivery_status AS ENUM ('preparing', 'waiting_pickup', 'in_transit', 'delivered', 'returned')
    `.execute(db);
	await sql`
        CREATE TYPE payment_method AS ENUM ('pix', 'credit_card', 'debit_card', 'cash')
    `.execute(db);

	await sql`
        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(40) NOT NULL,
            username VARCHAR(16) UNIQUE NOT NULL,
            email VARCHAR(60) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            phone_number VARCHAR(15) UNIQUE NOT NULL,
            role user_role NOT NULL DEFAULT 'customer',
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
            deleted_at TIMESTAMP,
            CHECK (updated_at >= created_at),
            CHECK (deleted_at IS NULL OR deleted_at >= created_at)
        )
    `.execute(db);

	await sql`
        CREATE INDEX idx_users_email ON users(email)
    `.execute(db);
	await sql`
        CREATE INDEX idx_users_username ON users(username)
    `.execute(db);

	await sql`
        CREATE TABLE brands (
            id SERIAL PRIMARY KEY,
            name VARCHAR(30) UNIQUE NOT NULL CHECK (name <> ''),
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
            deleted_at TIMESTAMP,
            CHECK (updated_at >= created_at),
            CHECK (deleted_at IS NULL OR deleted_at >= created_at)
        )
    `.execute(db);

	await sql`
        CREATE TABLE attributes (
            id SERIAL PRIMARY KEY,
            name VARCHAR(30) UNIQUE NOT NULL CHECK (name <> ''),
            description VARCHAR(255) NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
            deleted_at TIMESTAMP,
            CHECK (updated_at >= created_at),
            CHECK (deleted_at IS NULL OR deleted_at >= created_at)
        )
    `.execute(db);

	await sql`
        CREATE TABLE categories(
            id SERIAL PRIMARY KEY,
            name VARCHAR(30) UNIQUE NOT NULL CHECK (name <> ''),
            description VARCHAR(255),
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
            deleted_at TIMESTAMP,
            CHECK (updated_at >= created_at),
            CHECK (deleted_at IS NULL OR deleted_at >= created_at)
        )
    `.execute(db);

	await sql`
        CREATE TABLE images (
            id SERIAL PRIMARY KEY,
            path VARCHAR NOT NULL CHECK (path <> ''),
            description VARCHAR(255) NOT NULL,
            width INTEGER,
            height INTEGER,
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
            deleted_at TIMESTAMP,
            CHECK (updated_at >= created_at),
            CHECK (deleted_at IS NULL OR deleted_at >= created_at)
        )
    `.execute(db);

	await sql`
        CREATE TABLE products (
            id SERIAL PRIMARY KEY,
            name VARCHAR(30) UNIQUE NOT NULL CHECK (name <> ''),
            sku VARCHAR(12) UNIQUE NOT NULL CHECK (sku <> ''),
            description VARCHAR(255),
            price DECIMAL(10, 2) NOT NULL CHECK (price > 0),
            stock_quantity INTEGER NOT NULL CHECK (stock_quantity >= 0),
            brand_id INTEGER REFERENCES brands(id) ON DELETE SET NULL,
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
            deleted_at TIMESTAMP,
            CHECK (updated_at >= created_at),
            CHECK (deleted_at IS NULL OR deleted_at >= created_at)
        )
    `.execute(db);

	await sql`
        CREATE INDEX idx_products_brand_id ON products (brand_id)
    `.execute(db);
	await sql`
        CREATE INDEX idx_products_sku ON products(sku)
    `.execute(db);

	await sql`
        CREATE TABLE product_attributes (
            product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
            attribute_id INTEGER REFERENCES attributes(id) ON DELETE CASCADE,
            PRIMARY KEY (product_id, attribute_id)
        )
    `.execute(db);

	await sql`
        CREATE TABLE product_galleries (
            product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
            image_id INTEGER REFERENCES images(id) ON DELETE CASCADE,
            display_order INTEGER NOT NULL DEFAULT 0,
            PRIMARY KEY (product_id, image_id)
        )
    `.execute(db);

	await sql`
        CREATE TABLE product_categories (
            product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
            category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
            PRIMARY KEY (product_id, category_id)
        )
    `.execute(db);

	await sql`
        CREATE TABLE product_reviews (
            id SERIAL PRIMARY KEY,
            product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            rating DECIMAL(2,1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
            comment VARCHAR(255),
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
            deleted_at TIMESTAMP,
            UNIQUE (product_id, user_id),
            CHECK (updated_at >= created_at),
            CHECK (deleted_at IS NULL OR deleted_at >= created_at)
        )
    `.execute(db);

	await sql`
        CREATE INDEX idx_product_reviews_product_id ON product_reviews (product_id)
    `.execute(db);
	await sql`
        CREATE INDEX idx_product_reviews_user_id ON product_reviews (user_id)
    `.execute(db);

	await sql`
        CREATE TABLE carts (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
            converted_at TIMESTAMP,
            CHECK (updated_at >= created_at),
            CHECK (converted_at IS NULL OR converted_at >= created_at)
        )
    `.execute(db);

	await sql`
        CREATE INDEX idx_carts_user_id ON carts(user_id)
    `.execute(db);

	await sql`
        CREATE TABLE cart_items (
            id SERIAL PRIMARY KEY,
            cart_id INTEGER NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
            product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
            quantity INTEGER NOT NULL CHECK (quantity > 0),
            unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price > 0),
            total_price DECIMAL(10, 2) NOT NULL CHECK (total_price > 0),
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
            removed_at TIMESTAMP,
            CHECK (updated_at >= created_at),
            CHECK (removed_at IS NULL OR removed_at >= created_at)
        )
    `.execute(db);

	await sql`
        CREATE INDEX idx_cart_items_cart_id ON cart_items (cart_id)
    `.execute(db);
	await sql`
        CREATE INDEX idx_cart_items_product_id ON cart_items (product_id)
    `.execute(db);

	await sql`
        CREATE TABLE orders (
            id SERIAL PRIMARY KEY,
            cart_id INTEGER NOT NULL REFERENCES carts(id) ON DELETE RESTRICT,
            channel sales_channel NOT NULL DEFAULT 'online',
            current_status order_status NOT NULL DEFAULT 'pending',
            sub_total DECIMAL(10, 2) NOT NULL CHECK (sub_total >= 0),
            discount DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (discount >= 0),
            shipping_cost DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (shipping_cost >= 0),
            total DECIMAL(10, 2) NOT NULL CHECK (total > 0),
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
            CHECK (updated_at >= created_at)
        )
    `.execute(db);

	await sql`
        CREATE INDEX idx_orders_cart_id ON orders (cart_id)
    `.execute(db);
	await sql`
        CREATE INDEX idx_orders_current_status ON orders (current_status)
    `.execute(db);

	await sql`
        CREATE TABLE order_status_history (
            id SERIAL PRIMARY KEY,
            order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
            from_status order_status NOT NULL,
            to_status order_status NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
    `.execute(db);

	await sql`
        CREATE INDEX idx_order_status_history_order_id ON order_status_history (order_id)
    `.execute(db);

	await sql`
        CREATE TABLE payments (
            id SERIAL PRIMARY KEY,
            order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
            amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
            method payment_method NOT NULL,
            status payment_status NOT NULL DEFAULT 'pending',
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
            CHECK (updated_at >= created_at)
        )
    `.execute(db);

	await sql`
        CREATE INDEX idx_payments_order_id ON payments (order_id)
    `.execute(db);

	await sql`
        CREATE TABLE addresses (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            street VARCHAR(255) NOT NULL CHECK (street <> ''),
            house_number VARCHAR(10) NOT NULL CHECK (house_number <> ''),
            complement VARCHAR(50),
            city VARCHAR(100) NOT NULL,
            state VARCHAR(2) NOT NULL,
            cep VARCHAR(9) NOT NULL,
            is_default BOOLEAN NOT NULL DEFAULT false,
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
            deleted_at TIMESTAMP,
            CHECK (updated_at >= created_at),
            CHECK (deleted_at IS NULL OR deleted_at >= created_at)
        )
    `.execute(db);

	await sql`
        CREATE INDEX idx_addresses_user_id ON addresses (user_id)
    `.execute(db);

	await sql`
        CREATE TABLE shippings (
            id SERIAL PRIMARY KEY,
            order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
            tracking_code VARCHAR(50),
            address_id INTEGER NOT NULL REFERENCES addresses(id) ON DELETE RESTRICT,
            status delivery_status NOT NULL DEFAULT 'preparing',
            delivered_at TIMESTAMP,
            estimated_delivery DATE,
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
            CHECK (updated_at >= created_at),
            CHECK (estimated_delivery IS NULL OR estimated_delivery >= CAST(created_at AS DATE))
        )
    `.execute(db);

	await sql`
        CREATE INDEX idx_shippings_order_id ON shippings (order_id)
    `.execute(db);
	await sql`
        CREATE INDEX idx_shippings_address_id ON shippings (address_id)
    `.execute(db);
	await sql`
        CREATE INDEX idx_shippings_tracking_code ON shippings (tracking_code)
    `.execute(db);

	// Create function for auto-updating updated_at
	await sql`
        CREATE OR REPLACE FUNCTION set_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    `.execute(db);

	// Create triggers for all tables with updated_at
	const tablesWithUpdatedAt = [
		"users",
		"brands",
		"attributes",
		"categories",
		"images",
		"products",
		"product_reviews",
		"carts",
		"cart_items",
		"orders",
		"payments",
		"addresses",
		"shippings",
	];

	for (const table of tablesWithUpdatedAt) {
		await sql`
            CREATE TRIGGER update_${sql.raw(table)}_updated_at
            BEFORE UPDATE ON ${sql.table(table)}
            FOR EACH ROW EXECUTE FUNCTION set_updated_at();
        `.execute(db);
	}

	// Trigger to keep cart.updated_at in sync with cart_items
	await sql`
        CREATE OR REPLACE FUNCTION refresh_cart_updated_at()
        RETURNS TRIGGER AS $$
        DECLARE
            target_cart_id INT;
        BEGIN
            IF TG_OP = 'DELETE' THEN
                target_cart_id := OLD.cart_id;
            ELSE
                target_cart_id := NEW.cart_id;
            END IF;
            UPDATE carts SET updated_at = NOW() WHERE id = target_cart_id;
            RETURN COALESCE(NEW, OLD);
        END;
        $$ LANGUAGE plpgsql;
    `.execute(db);

	await sql`
        CREATE TRIGGER trigger_refresh_cart_updated_at
        AFTER INSERT OR UPDATE OR DELETE ON cart_items
        FOR EACH ROW EXECUTE FUNCTION refresh_cart_updated_at();
    `.execute(db);

	// Trigger to update order when status history is added
	await sql`
        CREATE OR REPLACE FUNCTION update_order_from_status_history()
        RETURNS TRIGGER AS $$
        BEGIN
            UPDATE orders 
            SET 
                updated_at = NOW(),
                current_status = NEW.to_status
            WHERE id = NEW.order_id;
            
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    `.execute(db);

	await sql`
        CREATE TRIGGER trigger_update_order_from_status_history
        AFTER INSERT ON order_status_history
        FOR EACH ROW
        EXECUTE FUNCTION update_order_from_status_history();
    `.execute(db);

	// Trigger to calculate cart_items.total_price
	await sql`
        CREATE OR REPLACE FUNCTION calculate_cart_item_total()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.total_price := NEW.quantity * NEW.unit_price;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    `.execute(db);

	await sql`
        CREATE TRIGGER trigger_calculate_cart_item_total
        BEFORE INSERT OR UPDATE OF quantity, unit_price ON cart_items
        FOR EACH ROW
        EXECUTE FUNCTION calculate_cart_item_total();
    `.execute(db);

	// Trigger to calculate order.total
	await sql`
        CREATE OR REPLACE FUNCTION calculate_order_total()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.total := NEW.sub_total - NEW.discount + NEW.shipping_cost;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    `.execute(db);

	await sql`
        CREATE TRIGGER trigger_calculate_order_total
        BEFORE INSERT OR UPDATE OF sub_total, discount, shipping_cost ON orders
        FOR EACH ROW
        EXECUTE FUNCTION calculate_order_total();
    `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
	// Drop all triggers on tables with updated_at
	await sql`
        DO $$
        DECLARE
            r RECORD;
        BEGIN
            FOR r IN 
                SELECT tgname, tgrelid::regclass AS table_name
                FROM pg_trigger 
                WHERE tgname LIKE 'update_%_updated_at'
            LOOP
                EXECUTE 'DROP TRIGGER IF EXISTS ' || quote_ident(r.tgname) || ' ON ' || r.table_name;
            END LOOP;
        END $$;
    `.execute(db);

	await sql`DROP FUNCTION IF EXISTS set_updated_at() CASCADE`.execute(db);

	await sql`
        DROP TRIGGER IF EXISTS trigger_refresh_cart_updated_at ON cart_items
    `.execute(db);
	await sql`
        DROP FUNCTION IF EXISTS refresh_cart_updated_at() CASCADE
    `.execute(db);

	await sql`
        DROP TRIGGER IF EXISTS trigger_update_order_from_status_history 
        ON order_status_history
    `.execute(db);
	await sql`
        DROP FUNCTION IF EXISTS update_order_from_status_history() CASCADE
    `.execute(db);

	await sql`
        DROP TRIGGER IF EXISTS trigger_calculate_cart_item_total ON cart_items
    `.execute(db);
	await sql`
        DROP FUNCTION IF EXISTS calculate_cart_item_total() CASCADE
    `.execute(db);

	await sql`
        DROP TRIGGER IF EXISTS trigger_calculate_order_total ON orders
    `.execute(db);
	await sql`
        DROP FUNCTION IF EXISTS calculate_order_total() CASCADE
    `.execute(db);

	// Drop tables in reverse order of creation
	const tables = [
		"shippings",
		"addresses",
		"payments",
		"order_status_history",
		"orders",
		"cart_items",
		"carts",
		"product_reviews",
		"product_categories",
		"product_galleries",
		"product_attributes",
		"products",
		"images",
		"categories",
		"attributes",
		"brands",
		"users",
	];

	for (const table of tables) {
		await sql`DROP TABLE IF EXISTS ${sql.table(table)} CASCADE`.execute(db);
	}

	// Drop ENUM types
	const enums = [
		"payment_method",
		"delivery_status",
		"payment_status",
		"order_status",
		"sales_channel",
		"user_role",
	];

	for (const enumType of enums) {
		await sql`DROP TYPE IF EXISTS ${sql.raw(enumType)} CASCADE`.execute(db);
	}
}
