import {
    pgTable,
    text,
    integer,
    timestamp,
    boolean,
    decimal,
    primaryKey,
} from "drizzle-orm/pg-core";
import type { AdapterAccount } from "next-auth/adapters";

// --- SEKCJA 1: AUTH.JS (Standard) ---

export const users = pgTable("user", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    name: text("name"),
    password: text("password"),
    email: text("email").notNull().unique(),
    emailVerified: timestamp("emailVerified", { mode: "date" }),
    image: text("image"),
    role: text("role").default("user"),
    street: text("street"),
    city: text("city"),
    postalCode: text("postal_code"),
    country: text("country").default("Poland"),
    phoneNumber: text("phone_number"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const accounts = pgTable(
    "account",
    {
        userId: text("userId")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        type: text("type").$type<AdapterAccount["type"]>().notNull(),
        provider: text("provider").notNull(),
        providerAccountId: text("providerAccountId").notNull(),
        refresh_token: text("refresh_token"),
        access_token: text("access_token"),
        expires_at: integer("expires_at"),
        token_type: text("token_type"),
        scope: text("scope"),
        id_token: text("id_token"),
        session_state: text("session_state"),
    },
    (account) => [
        primaryKey({
            columns: [account.provider, account.providerAccountId],
        }),
    ]
);

export const sessions = pgTable("session", {
    sessionToken: text("sessionToken").primaryKey(),
    userId: text("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
    "verificationToken",
    {
        identifier: text("identifier").notNull(),
        token: text("token").notNull(),
        expires: timestamp("expires", { mode: "date" }).notNull(),
    },
    (verificationToken) => [
        primaryKey({
            columns: [verificationToken.identifier, verificationToken.token],
        }),
    ]
);

// --- SEKCJA 2: SKLEP ---

export const products = pgTable("product", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    slug: text("slug").unique().notNull(),
    category: text("category").notNull(),
    description: text("description").notNull(),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    image: text("image").notNull(),
    images: text("images").array().notNull(),
    sizes: text("sizes").array(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orders = pgTable("order", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    userId: text("userId").references(() => users.id, { onDelete: "set null" }),
    customerName: text("customer_name").notNull(),
    customerEmail: text("customer_email").notNull(),
    shippingStreet: text("shipping_street").notNull(),
    shippingCity: text("shipping_city").notNull(),
    shippingPostalCode: text("shipping_postal_code").notNull(),
    shippingCountry: text("shipping_country").default("PL").notNull(),
    status: text("status").default("pending").notNull(),
    totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orderItems = pgTable("order_item", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    orderId: text("orderId")
        .notNull()
        .references(() => orders.id, { onDelete: "cascade" }),
    productId: text("productId")
        .notNull()
        .references(() => products.id),
    quantity: integer("quantity").notNull(),
    priceAtPurchase: decimal("price_at_purchase", { precision: 10, scale: 2 }).notNull(),
});