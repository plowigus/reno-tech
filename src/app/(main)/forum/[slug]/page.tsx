import { auth } from "@/auth";
import { db } from "@/db";
import { forumCategories, forumPosts } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { eq, desc } from "drizzle-orm";
import { Plus } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";


export default async function ForumCategoryPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const category = await db.query.forumCategories.findFirst({
        where: eq(forumCategories.slug, slug),
    });

    if (!category) {
        notFound();
    }

    const posts = await db.query.forumPosts.findMany({
        where: eq(forumPosts.categoryId, category.id),
        orderBy: [desc(forumPosts.createdAt)],
        with: {
            author: true,
        },
    });

    return (
        <div className="container py-10 max-w-5xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                        {category.name}
                    </h1>
                    <p className="text-zinc-400 max-w-2xl">
                        {category.description || "Dyskusje w tej kategorii."}
                    </p>
                </div>
                <Link href={`/forum/${slug}/new`}>
                    <Button className="bg-red-600 hover:bg-red-700 text-white font-medium">
                        <Plus className="mr-2 h-4 w-4" />
                        Dodaj temat
                    </Button>
                </Link>
            </div>

            <div className="space-y-4">
                {posts.length === 0 ? (
                    <div className="text-center py-20 bg-zinc-900/30 rounded-lg border border-white/5">
                        <h3 className="text-xl font-medium text-zinc-300 mb-2">
                            Brak tematów w tej kategorii
                        </h3>
                        <p className="text-zinc-500 mb-6">
                            Bądź pierwszą osobą, która rozpocznie dyskusję!
                        </p>
                        <Link href={`/forum/${slug}/new`}>
                            <Button variant="outline" className="border-red-600/30 text-red-500 hover:bg-red-600/10 hover:text-red-400">
                                Rozpocznij dyskusję
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {posts.map((post) => (
                            <Link
                                key={post.id}
                                href={`/forum/${slug}/topic/${post.slug}`}
                                className="group block"
                            >
                                <div className="bg-zinc-900/50 border border-white/5 rounded-lg p-5 transition-all duration-200 hover:border-red-600/30 hover:bg-zinc-900/80">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="space-y-1">
                                            <h3 className="text-lg font-semibold text-zinc-200 group-hover:text-white transition-colors">
                                                {post.title}
                                            </h3>
                                            <div className="flex items-center gap-2 text-xs text-zinc-500">
                                                <span>
                                                    Autor: <span className="text-zinc-400">{post.author?.name || "Anonim"}</span>
                                                </span>
                                                <span>•</span>
                                                <span>
                                                    {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Nieznana data'}
                                                </span>
                                                <span>•</span>
                                                <span>{post.views || 0} wyświetleń</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
