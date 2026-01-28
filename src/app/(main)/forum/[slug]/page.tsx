
import { auth } from "@/auth";
import { db } from "@/db";
import { forumCategories, forumPosts } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { eq, desc } from "drizzle-orm";
import { Plus, MessageSquare } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function formatDate(date: Date) {
    return new Intl.DateTimeFormat("pl-PL", {
        day: "numeric",
        month: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

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
        orderBy: [desc(forumPosts.updatedAt)],
        with: {
            author: true,
            comments: {
                orderBy: (comments, { desc }) => [desc(comments.createdAt)],
                // limit: 1, // REMOVED to get correct count of comments
                with: {
                    author: true,
                },
            },
        },
    });

    return (
        <div className="min-h-screen bg-background pt-32 pb-12 px-4">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/50 pb-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-zinc-500 mb-2">
                            <Link href="/forum" className="hover:text-zinc-300 transition-colors">Forum</Link>
                            <span>/</span>
                            <span className="text-zinc-300">{category.name}</span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-white">
                            {category.name}
                        </h1>
                    </div>
                    <Link href={`/forum/${slug}/new`}>
                        <Button className="bg-red-600 hover:bg-red-700 text-white font-medium shadow-lg shadow-red-900/20">
                            <Plus className="mr-2 h-4 w-4" />
                            Nowy Temat
                        </Button>
                    </Link>
                </div>

                {/* Table Section */}
                <Card className="bg-zinc-900/40 border-zinc-800 overflow-hidden shadow-sm backdrop-blur-sm">
                    <Table>
                        <TableHeader className="bg-zinc-900/80">
                            <TableRow className="border-zinc-800 hover:bg-transparent">
                                <TableHead className="w-12 text-center h-12"></TableHead>
                                <TableHead className="text-zinc-400 font-medium w-full">Temat / Autor</TableHead>
                                <TableHead className="text-center text-zinc-400 font-medium w-[150px] whitespace-nowrap">Statystyki</TableHead>
                                <TableHead className="text-right text-zinc-400 font-medium w-[200px] whitespace-nowrap pr-6">Ostatni post</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {posts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-40 text-center">
                                        <div className="flex flex-col items-center justify-center gap-2 text-zinc-500">
                                            <MessageSquare className="w-8 h-8 opacity-50" />
                                            <p>Brak tematów w tej kategorii. Bądź pierwszy!</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                posts.map((post) => {
                                    // Determine last activity info
                                    const lastComment = post.comments[0]; // First comment since we order by createdAt DESC
                                    const lastActiveUser = lastComment ? lastComment.author : post.author;
                                    const lastActiveDate = lastComment ? lastComment.createdAt : post.updatedAt;

                                    return (
                                        <TableRow
                                            key={post.id}
                                            className="border-zinc-800 hover:bg-zinc-900/60 transition-colors group"
                                        >
                                            <TableCell className="text-center align-middle">
                                                <div className="w-8 h-8 mx-auto bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800 text-zinc-500 group-hover:border-zinc-700 group-hover:text-zinc-400 transition-colors">
                                                    <MessageSquare className="w-4 h-4" />
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4 align-middle">
                                                <Link
                                                    href={`/forum/${slug}/topic/${post.slug}`}
                                                    className="block space-y-1"
                                                >
                                                    <div className="font-semibold text-zinc-200 text-base group-hover:text-red-500 transition-colors">
                                                        {post.title}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                                                        <span>Rozpoczęty przez:</span>
                                                        <span className="text-zinc-300 font-medium">{post.author?.name || "Anonim"}</span>
                                                        <span>• {post.createdAt ? formatDate(post.createdAt) : 'Nieznana data'}</span>
                                                    </div>
                                                </Link>
                                            </TableCell>

                                            {/* STATS COLUMN - REPLIES ONLY */}
                                            <TableCell className="text-center align-middle">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-base font-bold text-zinc-200">{post.comments.length}</span>
                                                    <span className="text-xs text-zinc-500">odpowiedzi</span>
                                                </div>
                                            </TableCell>

                                            <TableCell className="text-right align-middle pr-6">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-xs font-bold text-red-500">
                                                        {lastActiveUser?.name || "Użytkownik"}
                                                    </span>
                                                    <span className="text-[10px] text-zinc-500">
                                                        {lastActiveDate ? formatDate(lastActiveDate) : '--:--'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </div>
        </div>
    );
}
