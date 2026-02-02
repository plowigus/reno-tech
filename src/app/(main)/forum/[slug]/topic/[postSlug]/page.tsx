
import { db } from "@/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { formatDatePL } from "@/lib/utils"; // Importujemy helper z utils
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Quote, Flag } from "lucide-react";
import { ReplyForm } from "@/components/forum/reply-form";
import { forumPosts, forumComments } from "@/db/schema";
import { sql, eq } from "drizzle-orm";
import { ForumPost } from "@/components/forum/ForumPost";

// --- MAIN PAGE COMPONENT ---

// --- MAIN PAGE COMPONENT ---
export default async function TopicPage({ params }: { params: Promise<{ slug: string; postSlug: string }> }) {
    const { slug, postSlug } = await params;

    // Get session for permissions
    const session = await auth();
    const currentUser = session?.user;

    // 1. Parallel Data Fetching & Partial Selects
    const [post, category] = await Promise.all([
        db.query.forumPosts.findFirst({
            where: (posts, { eq }) => eq(posts.slug, postSlug),
            // Partial select for Main Post & Author
            with: {
                author: {
                    columns: {
                        id: true,
                        name: true,
                        image: true,
                        role: true,
                    }
                },
                comments: {
                    // Partial select for Comments & Comment Authors
                    with: {
                        author: {
                            columns: {
                                id: true,
                                name: true,
                                image: true,
                                role: true,
                            }
                        }
                    },
                    orderBy: (comments, { asc }) => [asc(comments.createdAt)],
                }
            }
        }),

        db.query.forumCategories.findFirst({
            where: (cats, { eq }) => eq(cats.slug, slug),
            columns: {
                id: true,
                name: true,
                slug: true,
            }
        })
    ]);

    if (!post) return notFound();

    // 2. ATOMIC VIEW INCREMENT (Server-side) - Fire and forget (or await if critical)
    await db.update(forumPosts)
        .set({ views: sql`${forumPosts.views} + 1` })
        .where(eq(forumPosts.id, post.id));

    // 3. FETCH USER STATS (Optimized for N+1)
    // Collect unique author IDs
    const authorIds = new Set<string>();
    if (post.authorId) authorIds.add(post.authorId);
    post.comments.forEach(c => {
        if (c.authorId) authorIds.add(c.authorId);
    });

    // Fetch stats in parallel for unique authors
    const uniqueAuthorIds = Array.from(authorIds);
    const statsPromises = uniqueAuthorIds.map(async (userId) => {
        const [postsCount, commentsCount] = await Promise.all([
            db.$count(forumPosts, eq(forumPosts.authorId, userId)),
            db.$count(forumComments, eq(forumComments.authorId, userId))
        ]);
        return { userId, total: postsCount + commentsCount };
    });

    const statsResults = await Promise.all(statsPromises);
    // Create a map for easy lookup
    const statsMap = new Map(statsResults.map(s => [s.userId, s.total]));

    return (
        <div className="min-h-screen bg-background pt-32 pb-12 px-4">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* NAV / TITLE */}
                <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                        <Link href="/forum" className="hover:text-red-500 transition-colors">Forum</Link>
                        <span>/</span>
                        <Link href={`/forum/${slug}`} className="hover:text-red-500 transition-colors">{category?.name || "Dział"}</Link>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                        {post.title}
                    </h1>
                </div>

                {/* THREAD CONTAINER */}
                <div className="space-y-0">
                    {/* 1. MAIN POST */}
                    <ForumPost
                        comment={{
                            ...post,
                            author: post.author || null,
                            authorId: post.authorId || "",
                            createdAt: post.createdAt || new Date(),
                            updatedAt: post.updatedAt,
                            content: post.content
                        }}
                        currentUser={currentUser && currentUser.id ? {
                            id: currentUser.id,
                            role: currentUser.role || "user"
                        } : undefined}
                        index={1}
                        isMainPost={true}
                        userPostCount={statsMap.get(post.authorId || "") || 0}
                    />

                    {/* 2. COMMENTS LIST */}
                    <div className="space-y-0">
                        {post.comments.map((comment) => (
                            <ForumPost
                                key={comment.id}
                                comment={{
                                    ...comment,
                                    createdAt: comment.createdAt || new Date(),
                                    authorId: comment.authorId || "",
                                }}
                                currentUser={currentUser && currentUser.id ? {
                                    id: currentUser.id,
                                    role: currentUser.role || "user"
                                } : undefined}
                            />
                        ))}
                    </div>
                </div>

                {/* 3. REPLY FORM */}
                <div className="mt-8 pt-8 border-t border-zinc-800">
                    <div className="bg-zinc-900/40 border border-zinc-800 rounded-md p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-red-600" />
                            Szybka odpowiedź
                        </h3>
                        <ReplyForm postId={post.id} />
                    </div>
                </div>

            </div>
        </div>
    );
}
