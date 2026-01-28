import { db } from "@/db";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Wrench, Zap, Speaker, Car, ShoppingCart, Coffee, MessageSquare } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

// Helper for Icons
const iconMap: Record<string, any> = {
    Wrench, Zap, Speaker, Car, ShoppingCart, Coffee
};

export default async function ForumPage() {
    const categories = await db.query.forumCategories.findMany({
        orderBy: (cats, { asc }) => [asc(cats.order)],
        with: {
            posts: {
                orderBy: (posts, { desc }) => [desc(posts.updatedAt)],
                with: {
                    // We need all comments to count them for "Posty", 
                    // and we need them sorted to find the latest author.
                    comments: {
                        orderBy: (comments, { desc }) => [desc(comments.createdAt)],
                        with: { author: true }
                    },
                    author: true
                }
            }
        }
    });

    return (
        <div className="min-h-screen bg-background pt-32 pb-12 px-4">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Centrum Wiedzy</h1>
                    <p className="text-zinc-400 mt-2">Wybierz dział, aby dołączyć do dyskusji.</p>
                </div>

                <Card className="bg-zinc-900/40 border-zinc-800 overflow-hidden">
                    <Table>
                        <TableHeader className="bg-zinc-900">
                            <TableRow className="border-zinc-800 hover:bg-transparent">
                                <TableHead className="w-full text-zinc-400 h-12">Dział</TableHead>
                                <TableHead className="text-center text-zinc-400 w-[100px] whitespace-nowrap">Tematy</TableHead>
                                <TableHead className="text-center text-zinc-400 w-[100px] whitespace-nowrap">Posty</TableHead>
                                <TableHead className="text-right text-zinc-400 w-[300px] whitespace-nowrap pr-6">Ostatnia aktywność</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.map((category) => {
                                const Icon = iconMap[category.icon || "MessageSquare"] || MessageSquare;

                                // Stats Calculation
                                const topicsCount = category.posts.length;
                                const postsCount = topicsCount + category.posts.reduce((acc, p) => acc + p.comments.length, 0);

                                // Last Activity Logic
                                const lastPost = category.posts[0]; // Ordered by updatedAt DESC

                                // Determine who was actually active (Commenter OR Thread Author)
                                let lastActiveUser = lastPost?.author;
                                let lastActiveDate = lastPost?.updatedAt;

                                if (lastPost) {
                                    const lastComment = lastPost.comments[0]; // Ordered by createdAt DESC
                                    if (lastComment) {
                                        lastActiveUser = lastComment.author;
                                        lastActiveDate = lastComment.createdAt;
                                    }
                                }

                                return (
                                    <TableRow key={category.id} className="border-zinc-800 hover:bg-zinc-900/60 transition-colors group">
                                        <TableCell className="py-4">
                                            <Link href={`/forum/${category.slug}`} className="flex items-center gap-4 block w-full">
                                                <div className="p-3 bg-zinc-900 rounded-md border border-zinc-800 text-red-600 group-hover:text-red-500 group-hover:border-red-600/30 transition-all">
                                                    <Icon className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-zinc-100 text-lg group-hover:text-red-500 transition-colors">
                                                        {category.name}
                                                    </div>
                                                    <div className="text-sm text-zinc-500">
                                                        {category.description}
                                                    </div>
                                                </div>
                                            </Link>
                                        </TableCell>

                                        <TableCell className="text-center font-medium text-zinc-300">
                                            {topicsCount}
                                        </TableCell>

                                        <TableCell className="text-center font-medium text-zinc-300">
                                            {postsCount}
                                        </TableCell>

                                        <TableCell className="text-right pr-6">
                                            {lastPost && lastActiveUser ? (
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className="text-xs font-bold text-red-500">
                                                        {lastActiveUser.name || "Użytkownik"}
                                                    </span>
                                                    <span className="text-[10px] text-zinc-500">
                                                        {lastActiveDate ? format(lastActiveDate, "dd MMM yyyy, HH:mm", { locale: pl }) : ""}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-zinc-600">-</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </Card>

            </div>
        </div>
    );
}
