"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { forumCategories, forumPosts, forumComments } from "@/db/schema";
import { createPostSchema, createCommentSchema } from "@/lib/validators/forum-schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createPostAction(categoryId: string, formData: FormData) {
    const session = await auth();

    if (!session?.user?.id) {
        return { error: "Musisz być zalogowany, aby dodać post." };
    }

    const rawData = {
        title: formData.get("title"),
        content: formData.get("content"),
        categoryId: categoryId,
    };

    const validation = createPostSchema.safeParse(rawData);

    if (!validation.success) {
        return { error: "Błąd walidacji danych." };
    }

    const { title, content } = validation.data;

    // Generate slug
    let slug = title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");

    // Basic check for uniqueness (simple version)
    const existingPost = await db.query.forumPosts.findFirst({
        where: eq(forumPosts.slug, slug),
    });

    if (existingPost) {
        slug = `${slug}-${Math.floor(Math.random() * 10000)}`;
    }

    // Get Category Slug for redirect
    const category = await db.query.forumCategories.findFirst({
        where: eq(forumCategories.id, categoryId),
    });

    if (!category) {
        return { error: "Kategoria nie istnieje." };
    }

    try {
        await db.insert(forumPosts).values({
            title,
            content,
            categoryId,
            authorId: session.user.id,
            slug,
            views: 0,
            pinned: false,
        });
    } catch (error) {
        console.error("Error creating post:", error);
        return { error: "Wystąpił błąd podczas tworzenia posta." };
    }

    const path = `/forum/${category.slug}`;
    revalidatePath(path);
    redirect(`${path}/topic/${slug}`);
}

export async function createCommentAction(postId: string, formData: FormData) {
    const session = await auth();

    if (!session?.user?.id) {
        return { error: "Musisz być zalogowany, aby dodać komentarz." };
    }

    const rawData = {
        content: formData.get("content"),
        postId: postId,
    };

    const validation = createCommentSchema.safeParse(rawData);

    if (!validation.success) {
        return { error: "Błąd walidacji danych." };
    }

    const { content } = validation.data;

    try {
        await db.insert(forumComments).values({
            content,
            postId,
            authorId: session.user.id,
        });

        // ... (previous code)

        // BUMP LOGIC: Update the parent post's timestamp
        await db.update(forumPosts)
            .set({ updatedAt: new Date() })
            .where(eq(forumPosts.id, postId));

        // NOTIFICATION LOGIC
        const topic = await db.query.forumPosts.findFirst({
            where: eq(forumPosts.id, postId),
        });

        if (topic && topic.authorId && topic.authorId !== session.user.id) {
            await db.insert(notifications).values({
                recipientId: topic.authorId,
                senderId: session.user.id,
                type: "REPLY",
                resourceId: topic.id, // Redirect to the topic
                content: `Użytkownik ${session.user.name} odpowiedział w Twoim temacie: ${topic.title}`,
                isRead: false,
            });
        }

    } catch (error) {
        console.error("Error creating comment:", error);
        return { error: "Wystąpił błąd podczas dodawania komentarza." };
    }

    const post = await db.query.forumPosts.findFirst({
        where: eq(forumPosts.id, postId),
        with: {
            category: true,
        },
    });

    if (post && post.category) {
        revalidatePath(`/forum/${post.category.slug}/topic/${post.slug}`);
    }
}

// --- TOPIC ACTIONS ---

export async function deleteTopic(topicId: string) {
    const session = await auth();
    if (!session?.user) return { error: "Musisz być zalogowany." };

    const topic = await db.query.forumPosts.findFirst({
        where: eq(forumPosts.id, topicId),
    });

    if (!topic) return { error: "Temat nie istnieje." };

    const isOwner = topic.authorId === session.user.id;
    const isAdmin = session.user.role === "admin" || session.user.role === "moderator";

    if (!isOwner && !isAdmin) {
        return { error: "Brak uprawnień do usunięcia tego tematu." };
    }

    await db.delete(forumPosts).where(eq(forumPosts.id, topicId));

    // We assume revalidatePath will happen on the client or generic forum page
    revalidatePath("/forum");
    return { success: "Temat usunięty." };
}

export async function updateTopic(topicId: string, newContent: string) {
    const session = await auth();
    if (!session?.user) return { error: "Brak autoryzacji." };

    const topic = await db.query.forumPosts.findFirst({
        where: eq(forumPosts.id, topicId),
    });

    if (!topic) return { error: "Temat nie istnieje." };

    const isOwner = topic.authorId === session.user.id;
    const isAdmin = session.user.role === "admin" || session.user.role === "moderator";

    if (!isOwner && !isAdmin) {
        return { error: "Tylko autor może edytować temat." };
    }

    await db.update(forumPosts)
        .set({ content: newContent, updatedAt: new Date() })
        .where(eq(forumPosts.id, topicId));

    revalidatePath("/forum");
    return { success: "Temat zaktualizowany." };
}

// --- COMMENT ACTIONS ---

export async function deleteComment(commentId: string) {
    const session = await auth();
    if (!session?.user) return { error: "Musisz być zalogowany." };

    const comment = await db.query.forumComments.findFirst({
        where: eq(forumComments.id, commentId),
    });

    if (!comment) return { error: "Komentarz nie istnieje." };

    const isOwner = comment.authorId === session.user.id;
    const isAdmin = session.user.role === "admin" || session.user.role === "moderator";

    if (!isOwner && !isAdmin) {
        return { error: "Brak uprawnień do usunięcia tego komentarza." };
    }

    await db.delete(forumComments).where(eq(forumComments.id, commentId));

    // Find topic to revalidate
    const topic = await db.query.forumPosts.findFirst({
        where: eq(forumPosts.id, comment.postId || ""),
        with: { category: true }
    });

    if (topic && topic.category) {
        revalidatePath(`/forum/${topic.category.slug}/topic/${topic.slug}`);
    }

    return { success: "Komentarz usunięty." };
}

export async function updateComment(commentId: string, newContent: string) {
    const session = await auth();
    if (!session?.user) return { error: "Brak autoryzacji." };

    const comment = await db.query.forumComments.findFirst({
        where: eq(forumComments.id, commentId),
    });

    if (!comment) return { error: "Komentarz nie istnieje." };

    const isOwner = comment.authorId === session.user.id;
    const isAdmin = session.user.role === "admin" || session.user.role === "moderator";

    if (!isOwner && !isAdmin) {
        return { error: "Tylko autor może edytować komentarz." };
    }

    await db.update(forumComments)
        .set({ content: newContent }) // Note: forumComments might not have updatedAt? Checked schema in step 672 view: it has createdAt. Does it update parent post updatedAt? Maybe. But let's just update content for now.
        .where(eq(forumComments.id, commentId));

    // Optional: Bump logic for post? Maybe not for editing a comment.

    // Revalidate
    const topic = await db.query.forumPosts.findFirst({
        where: eq(forumPosts.id, comment.postId || ""),
        with: { category: true }
    });

    if (topic && topic.category) {
        revalidatePath(`/forum/${topic.category.slug}/topic/${topic.slug}`);
    }

    return { success: "Komentarz zaktualizowany." };
}

// --- NOTIFICATION ACTIONS ---

import { notifications } from "@/db/schema";
import { desc, and } from "drizzle-orm";

export async function getUnreadNotifications() {
    const session = await auth();
    if (!session?.user?.id) return [];

    const data = await db.query.notifications.findMany({
        where: and(
            eq(notifications.recipientId, session.user.id),
            eq(notifications.isRead, false)
        ),
        orderBy: [desc(notifications.createdAt)],
        with: {
            sender: {
                columns: {
                    name: true,
                    image: true,
                }
            }
        }
    });

    return data;
}

export async function markNotificationAsRead(notificationId: string) {
    const session = await auth();
    if (!session?.user?.id) return;

    await db.update(notifications)
        .set({ isRead: true })
        .where(and(
            eq(notifications.id, notificationId),
            eq(notifications.recipientId, session.user.id)
        ));

    revalidatePath("/");
}

export async function markAllNotificationsAsRead() {
    const session = await auth();
    if (!session?.user?.id) return;

    await db.update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.recipientId, session.user.id));

    revalidatePath("/");
}

export async function markAsReadAndGetUrl(notificationId: string) {
    const session = await auth();
    if (!session?.user?.id) return null;

    // 1. Mark as read
    await db.update(notifications)
        .set({ isRead: true })
        .where(and(
            eq(notifications.id, notificationId),
            eq(notifications.recipientId, session.user.id)
        ));

    // 2. Fetch notification details to get resourceId
    const notification = await db.query.notifications.findFirst({
        where: eq(notifications.id, notificationId),
    });

    if (!notification || !notification.resourceId) return null;

    // 3. Resolve URL based on type
    if (notification.type === "REPLY") {
        const topic = await db.query.forumPosts.findFirst({
            where: eq(forumPosts.id, notification.resourceId),
            with: { category: true }
        });

        if (topic && topic.category) {
            revalidatePath("/"); // Update badge
            return `/forum/${topic.category.slug}/topic/${topic.slug}`;
        }
    }

    // Default fallback
    revalidatePath("/");
    return "/forum";
}
