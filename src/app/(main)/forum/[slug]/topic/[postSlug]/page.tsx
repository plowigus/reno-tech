import { auth } from "@/auth";
import { db } from "@/db";
import { forumPosts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

export default async function TopicPage({
    params,
}: {
    params: Promise<{ slug: string; postSlug: string }>;
}) {
    const { postSlug } = await params;
    const post = await db.query.forumPosts.findFirst({
        where: eq(forumPosts.slug, postSlug),
        with: {
            author: true,
            category: true,
        }
    });

    if (!post) {
        notFound();
    }

    return (
        <div className="container py-20">
            <h1 className="text-4xl font-bold text-white mb-4">{post.title}</h1>
            <div className="flex items-center gap-4 text-zinc-400 mb-8">
                <span>Autor: {post.author?.name || "Anonim"}</span>
                <span>{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ""}</span>
                <span>Kategoria: {post.category?.name}</span>
            </div>
            <div className="prose prose-invert max-w-none">
                <p className="whitespace-pre-wrap">{post.content}</p>
            </div>
        </div>
    );
}
