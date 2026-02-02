import {
    pgTable,
    text,
    integer,
    timestamp,
    boolean,
    decimal,
    primaryKey,
    uuid,
    pgEnum,
} from "drizzle-orm/pg-core";
import type { AdapterAccount } from "next-auth/adapters";

// --- SECTION 1: AUTH.JS (Standard) ---

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
    lastSeen: timestamp("last_seen").defaultNow(),
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

// --- SECTION 2: SHOP ---

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
    p24SessionId: text("p24_session_id").unique(),
    p24OrderId: integer("p24_order_id"),
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
    size: text("size"),
    priceAtPurchase: decimal("price_at_purchase", { precision: 10, scale: 2 }).notNull(),
});

// --- SECTION 3: BLOG ---

export const posts = pgTable("post", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    title: text("title").notNull(),
    slug: text("slug").unique().notNull(),
    content: text("content").notNull(),
    excerpt: text("excerpt"),
    coverImage: text("cover_image"),
    published: boolean("published").default(false).notNull(),
    authorId: text("authorId").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// --- SECTION 4: USER INTERACTIONS (Cart & Wishlist) ---

export const carts = pgTable("cart", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    userId: text("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const cartItems = pgTable("cart_item", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    cartId: text("cartId")
        .notNull()
        .references(() => carts.id, { onDelete: "cascade" }),
    productId: text("productId")
        .notNull()
        .references(() => products.id, { onDelete: "cascade" }),
    quantity: integer("quantity").default(1).notNull(),
    size: text("size"),
});

export const wishlists = pgTable("wishlist", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    userId: text("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    productId: text("productId")
        .notNull()
        .references(() => products.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- SECTION 5: FORUM ---

export const forumCategories = pgTable("forum_category", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").unique().notNull(),
    description: text("description"),
    icon: text("icon"),
    order: integer("order").default(0),
});

export const forumPosts = pgTable("forum_post", {
    id: uuid("id").defaultRandom().primaryKey(),
    categoryId: uuid("categoryId").references(() => forumCategories.id),
    authorId: text("authorId").references(() => users.id),
    title: text("title").notNull(),
    content: text("content").notNull(),
    slug: text("slug").unique(),
    views: integer("views").default(0),
    pinned: boolean("pinned").default(false),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const forumComments = pgTable("forum_comment", {
    id: uuid("id").defaultRandom().primaryKey(),
    postId: uuid("postId").references(() => forumPosts.id),
    authorId: text("authorId").references(() => users.id),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});

// --- SECTION 6: NOTIFICATIONS ---

export const notificationTypeEnum = pgEnum("notification_type", [
    "REPLY",
    "MENTION",
    "SYSTEM",
    "FRIEND_REQUEST",
    "FRIEND_ACCEPT"
]);

export const notifications = pgTable("notification", {
    id: uuid("id").defaultRandom().primaryKey(),
    recipientId: text("recipient_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    senderId: text("sender_id").references(() => users.id, { onDelete: "set null" }), // Nullable for SYSTEM
    type: notificationTypeEnum("type").notNull(),
    resourceId: text("resource_id"), // ID of the topic or post to redirect to
    content: text("content"), // Optional short text preview
    isRead: boolean("is_read").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- RELATIONS ---
import { relations } from "drizzle-orm";

export const usersRelations = relations(users, ({ one, many }) => ({
    cart: one(carts, {
        fields: [users.id],
        references: [carts.userId],
    }),
    wishlist: many(wishlists),
    orders: many(orders),
    notificationsReceived: many(notifications, { relationName: "recipientNotifications" }),
    notificationsSent: many(notifications, { relationName: "senderNotifications" }),
    conversations: many(conversationParticipants),
    messages: many(messages),
    sentFriendRequests: many(friendRequests, { relationName: "sentRequests" }),
    receivedFriendRequests: many(friendRequests, { relationName: "receivedRequests" }),
    friends: many(friends, { relationName: "userFriends" }),
}));

export const cartsRelations = relations(carts, ({ one, many }) => ({
    user: one(users, {
        fields: [carts.userId],
        references: [users.id],
    }),
    items: many(cartItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
    cart: one(carts, {
        fields: [cartItems.cartId],
        references: [carts.id],
    }),
    product: one(products, {
        fields: [cartItems.productId],
        references: [products.id],
    }),
}));

export const wishlistsRelations = relations(wishlists, ({ one }) => ({
    user: one(users, {
        fields: [wishlists.userId],
        references: [users.id],
    }),
    product: one(products, {
        fields: [wishlists.productId],
        references: [products.id],
    }),
}));

export const productsRelations = relations(products, ({ many }) => ({
    cartItems: many(cartItems),
    wishlistedBy: many(wishlists),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
    user: one(users, {
        fields: [orders.userId],
        references: [users.id],
    }),
    items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
    order: one(orders, {
        fields: [orderItems.orderId],
        references: [orders.id],
    }),
    product: one(products, {
        fields: [orderItems.productId],
        references: [products.id],
    }),
}));

export const forumCategoriesRelations = relations(forumCategories, ({ many }) => ({
    posts: many(forumPosts),
}));

export const forumPostsRelations = relations(forumPosts, ({ one, many }) => ({
    category: one(forumCategories, {
        fields: [forumPosts.categoryId],
        references: [forumCategories.id],
    }),
    author: one(users, {
        fields: [forumPosts.authorId],
        references: [users.id],
    }),
    comments: many(forumComments),
}));

export const forumCommentsRelations = relations(forumComments, ({ one }) => ({
    post: one(forumPosts, {
        fields: [forumComments.postId],
        references: [forumPosts.id],
    }),
    author: one(users, {
        fields: [forumComments.authorId],
        references: [users.id],
    }),
}));

export const usersForumRelations = relations(users, ({ many }) => ({
    forumPosts: many(forumPosts),
    forumComments: many(forumComments),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
    recipient: one(users, {
        fields: [notifications.recipientId],
        references: [users.id],
        relationName: "recipientNotifications",
    }),
    sender: one(users, {
        fields: [notifications.senderId],
        references: [users.id],
        relationName: "senderNotifications",
    }),
}));

// --- SECTION 7: CHAT SYSTEM ---

export const conversations = pgTable("conversation", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name"), // Opcjonalne: Dla rozmów grupowych
    isGroup: boolean("is_group").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    lastMessageAt: timestamp("last_message_at").defaultNow(), // Do sortowania listy rozmów
});

export const conversationParticipants = pgTable("conversation_participant", {
    conversationId: uuid("conversation_id")
        .notNull()
        .references(() => conversations.id, { onDelete: "cascade" }),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    lastReadAt: timestamp("last_read_at"), // Do liczenia nieprzeczytanych wiadomości
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
}, (t) => [
    primaryKey({ columns: [t.conversationId, t.userId] }),
]);

export const messages = pgTable("message", {
    id: uuid("id").defaultRandom().primaryKey(),
    conversationId: uuid("conversation_id")
        .notNull()
        .references(() => conversations.id, { onDelete: "cascade" }),
    senderId: text("sender_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- UPDATE RELATIONS ---

export const conversationsRelations = relations(conversations, ({ many }) => ({
    participants: many(conversationParticipants),
    messages: many(messages),
}));

export const conversationParticipantsRelations = relations(conversationParticipants, ({ one }) => ({
    conversation: one(conversations, {
        fields: [conversationParticipants.conversationId],
        references: [conversations.id],
    }),
    user: one(users, {
        fields: [conversationParticipants.userId],
        references: [users.id],
    }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
    conversation: one(conversations, {
        fields: [messages.conversationId],
        references: [conversations.id],
    }),
    sender: one(users, {
        fields: [messages.senderId],
        references: [users.id],
        relationName: "senderMessages", // Added relationName for clarity/consistency though not strictly required if not used in query
    }),
}));

// --- SECTION 8: FRIENDS SYSTEM ---

export const friendRequests = pgTable("friend_request", {
    senderId: text("sender_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    receiverId: text("receiver_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [
    // Ensure unique request between two users
    primaryKey({ columns: [t.senderId, t.receiverId] }),
]);

export const friends = pgTable("friend", {
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    friendId: text("friend_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [
    primaryKey({ columns: [t.userId, t.friendId] }),
]);

// --- UPDATE RELATIONS ---

export const friendRequestsRelations = relations(friendRequests, ({ one }) => ({
    sender: one(users, {
        fields: [friendRequests.senderId],
        references: [users.id],
        relationName: "sentRequests",
    }),
    receiver: one(users, {
        fields: [friendRequests.receiverId],
        references: [users.id],
        relationName: "receivedRequests",
    }),
}));

export const friendsRelations = relations(friends, ({ one }) => ({
    user: one(users, {
        fields: [friends.userId],
        references: [users.id],
        relationName: "userFriends", // My link to the friend record
    }),
    friend: one(users, {
        fields: [friends.friendId],
        references: [users.id],
        relationName: "friendUsers", // The friend's user details
    }),
}));