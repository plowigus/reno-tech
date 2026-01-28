"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { forumCategories, forumPosts } from "@/db/schema";
import { createPostSchema } from "@/lib/validators/forum-schema";
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
