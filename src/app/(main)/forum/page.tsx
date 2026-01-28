import { db } from "@/db";
import { forumCategories, forumPosts } from "@/db/schema";
import { asc, desc } from "drizzle-orm";
import Link from "next/link";
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
import {
    Wrench,
    Zap,
    Speaker,
    Car,
    ShoppingCart,
    Coffee,
    MessageSquare,
    type LucideIcon
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
    Wrench,
    Zap,
    Speaker,
    Car,
    ShoppingCart,
    Coffee,
};

function formatDate(date: Date) {
    return new Intl.DateTimeFormat("pl-PL", {
        day: "numeric",
        month: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

export default async function ForumPage() {
    const categories = await db.query.forumCategories.findMany({
        orderBy: [asc(forumCategories.order)],
        with: {
            posts: {
                orderBy: [desc(forumPosts.updatedAt)],
                with: {
                    author: true,
                    comments: true,
                },
            },
        },
    });

    return (
        <div className="min-h-screen bg-background pt-32 pb-12 px-4">
            <div className="max-w-7xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Centrum Wiedzy</h1>
                    <p className="text-zinc-400 mt-1 text-sm">Przeglądaj działy i dołącz do dyskusji.</p>
                </div>

                <Card className="bg-zinc-900/40 border-zinc-800 overflow-hidden shadow-sm backdrop-blur-sm">
                    <Table>
                        <TableHeader className="bg-zinc-900/80">
                            <TableRow className="border-zinc-800 hover:bg-transparent">
                                <TableHead className="text-zinc-400 h-12 w-full pl-6">Dział</TableHead>
                                <TableHead className="text-center text-zinc-400 w-[100px] whitespace-nowrap">Tematy</TableHead>
                                <TableHead className="text-center text-zinc-400 w-[100px] whitespace-nowrap">Posty</TableHead>
                                <TableHead className="text-right text-zinc-400 w-[220px] whitespace-nowrap pr-6">Ostatnia aktywność</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.map((category) => {
                                const IconComponent = category.icon && iconMap[category.icon]
                                    ? iconMap[category.icon]
                                    : MessageSquare;

                                const topicCount = category.posts.length;
                                // Calculate total replies (posts/comments)
                                const postsCount = category.posts.reduce((acc, post) => acc + post.comments.length, 0);

                                const lastPost = category.posts[0];

                                return (
                                    <TableRow
                                        key={category.id}
                                        className="border-zinc-800 hover:bg-zinc-900/60 transition-colors cursor-pointer group"
                                    >
                                        <TableCell className="py-5 pl-6">
                                            <Link href={`/forum/${category.slug}`} className="flex items-center gap-4 block w-full h-full">
                                                <div className="p-2.5 bg-zinc-900/80 rounded-lg border border-zinc-800 text-red-600 group-hover:border-red-600/30 group-hover:text-red-500 transition-colors">
                                                    <IconComponent className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-zinc-200 text-base group-hover:text-white transition-colors">
                                                        {category.name}
                                                    </div>
                                                    <div className="text-sm text-zinc-500 line-clamp-1 mt-0.5">
                                                        {category.description || "Brak opisu."}
                                                    </div>
                                                </div>
                                            </Link>
                                        </TableCell>
                                        <TableCell className="text-center align-middle">
                                            <div className="text-sm font-medium text-zinc-300">{topicCount}</div>
                                        </TableCell>
                                        <TableCell className="text-center align-middle">
                                            <div className="text-sm font-medium text-zinc-300">{postsCount}</div>
                                        </TableCell>
                                        <TableCell className="text-right align-middle pr-6">
                                            {lastPost ? (
                                                <div className="flex flex-col items-end gap-1.5">
                                                    <span className="text-xs text-zinc-400">
                                                        {lastPost.updatedAt ? formatDate(lastPost.updatedAt) : ""}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-medium text-zinc-300">
                                                            {lastPost.author?.name || "Użytkownik usunięty"}
                                                        </span>
                                                        <Avatar className="h-5 w-5 border border-white/10">
                                                            <AvatarImage src={lastPost.author?.image || undefined} />
                                                            <AvatarFallback className="text-[9px] bg-zinc-800 text-zinc-400">
                                                                {(lastPost.author?.name || "U")[0].toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-zinc-500">Brak aktywności</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}

                            {categories.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-32 text-center text-zinc-500">
                                        Brak kategorii do wyświetlenia.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </div>
        </div>
    );
}
