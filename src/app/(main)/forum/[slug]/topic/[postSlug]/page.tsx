
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
import { RichTextRenderer } from "@/components/ui/rich-text-renderer"; // Import Renderer
import { PostActions } from "@/components/forum/PostActions";

// --- HELPER COMPONENT: THE CLASSIC FORUM POST ---
const ForumPostBlock = ({
    author,
    content,
    createdAt,
    isMainPost = false,
    index,
    userPostCount = 0,
    currentUser,
    postId
}: {
    author: any,
    content: string,
    createdAt: Date,
    isMainPost?: boolean,
    index: number,
    userPostCount?: number,
    currentUser: any,
    postId: string
}) => {
    return (
        <div className={`mb-4 border border-zinc-800 rounded-md overflow-hidden ${isMainPost ? "bg-zinc-900/60 shadow-md" : "bg-zinc-900/20"}`}>
            {/* POST HEADER BAR (Mobile Only / Top bar info) */}
            <div className="md:hidden bg-zinc-900 p-3 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8 md:w-10 md:h-10">
                        <AvatarImage src={author?.image || undefined} />
                        <AvatarFallback>{(author?.name || "U")?.[0]}</AvatarFallback>
                    </Avatar>
                    <span className={`font-bold ${isMainPost ? "text-red-500" : "text-zinc-200"}`}>{author?.name || "Użytkownik"}</span>
                </div>
                <span className="text-xs text-zinc-500">{formatDatePL(createdAt, "dd MMM yyyy")}</span>
            </div>

            <div className="flex flex-col md:flex-row">
                {/* LEFT COLUMN: USER INFO (Desktop Sidebar) */}
                <div className="hidden md:flex w-48 flex-col items-center p-6 bg-zinc-900/50 border-r border-zinc-800 text-center gap-3">
                    <Avatar className="w-20 h-20 border-2 border-zinc-800 shadow-xl">
                        <AvatarImage src={author?.image || undefined} />
                        <AvatarFallback className="text-2xl bg-zinc-800 text-zinc-400">{(author?.name || "U")?.[0].toUpperCase()}</AvatarFallback>
                    </Avatar>

                    <div className="space-y-1">
                        <div className={`font-bold text-lg ${isMainPost ? "text-red-500" : "text-white"}`}>
                            {author?.name || "Użytkownik"}
                        </div>
                        <Badge variant="outline" className="border-zinc-700 text-zinc-400 text-[10px] uppercase">
                            {author?.role || "Użytkownik"}
                        </Badge>
                    </div>

                    <div className="w-full h-px bg-zinc-800 my-2" />

                    <div className="text-xs text-zinc-500 space-y-1">
                        <p>Dołączył:</p>
                        <p className="text-zinc-400">
                            {author?.createdAt ? formatDatePL(author.createdAt, "yyyy-MM-dd") : "Nieznana"}
                        </p>
                        <p>Postów: <span className="text-zinc-300">{userPostCount}</span></p>
                    </div>
                </div>

                {/* RIGHT COLUMN: CONTENT */}
                <div className="flex-1 flex flex-col min-h-[200px]">
                    {/* Desktop Post Header */}
                    <div className="hidden md:flex justify-between items-center p-3 border-b border-zinc-800/50 text-xs text-zinc-500 bg-zinc-900/30">
                        <span>Wysłany: {formatDatePL(createdAt, "d MMMM yyyy, HH:mm")}</span>
                        <span className="opacity-50">#{index}</span>
                    </div>

                    {/* Main Content */}
                    <div className="p-6 text-zinc-300 leading-relaxed min-h-[100px] flex-1">
                        <RichTextRenderer content={content} />
                    </div>

                    {/* Footer / Actions */}
                    <div className="p-3 border-t border-zinc-800/50 flex justify-end gap-2 bg-zinc-900/30">
                        {/* We render PostActions here. Note: This component is rendered for both Main Post and Comments. */}
                        <PostActions
                            postId={postId}
                            authorName={author?.name || "Użytkownik"}
                            contentHtml={content}
                            isOwner={currentUser?.id === author?.id}
                            isAdmin={currentUser?.role === "admin" || currentUser?.role === "moderator"}
                            type={isMainPost ? "TOPIC" : "COMMENT"}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- MAIN PAGE COMPONENT ---
export default async function TopicPage({ params }: { params: Promise<{ slug: string; postSlug: string }> }) {
    const { slug, postSlug } = await params;

    // Get session for permissions
    const session = await auth();
    const currentUser = session?.user;

    const post = await db.query.forumPosts.findFirst({
        where: (posts, { eq }) => eq(posts.slug, postSlug),
        with: {
            author: true,
            comments: {
                with: { author: true },
                orderBy: (comments, { asc }) => [asc(comments.createdAt)],
            }
        }
    });

    if (!post) return notFound();

    // 1. ATOMIC VIEW INCREMENT (Server-side)
    // We execute this immediately. No need to await if we don't need the result immediately,
    // but better to await to ensure it runs successfully.
    await db.update(forumPosts)
        .set({ views: sql`${forumPosts.views} + 1` })
        .where(eq(forumPosts.id, post.id));

    // 2. FETCH USER STATS (Optimized for N+1)
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

    // Fetch Category Name for Breadcrumbs
    const category = await db.query.forumCategories.findFirst({
        where: (cats, { eq }) => eq(cats.slug, slug),
    });

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
                    <ForumPostBlock
                        author={post.author}
                        content={post.content}
                        createdAt={post.createdAt!}
                        isMainPost={true}
                        index={1}
                        userPostCount={statsMap.get(post.authorId || "") || 0}
                        currentUser={currentUser}
                        postId={post.id}
                    />

                    {/* 2. COMMENTS LIST */}
                    {post.comments.map((comment, i) => (
                        <ForumPostBlock
                            key={comment.id}
                            author={comment.author}
                            content={comment.content}
                            createdAt={comment.createdAt!}
                            index={i + 2}
                            userPostCount={statsMap.get(comment.authorId || "") || 0}
                            currentUser={currentUser}
                            postId={comment.id}
                        />
                    ))}
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
