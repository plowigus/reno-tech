
import { db } from "@/db";
import { forumCategories } from "@/db/schema";
import { asc } from "drizzle-orm";
import Link from "next/link";
import { MessageSquare } from "lucide-react";

export default async function ForumPage() {
    const categories = await db.query.forumCategories.findMany({
        orderBy: [asc(forumCategories.order)],
    });

    return (
        <div className="container py-10 max-w-5xl mx-auto space-y-8">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold tracking-tight text-white">
                    Forum Dyskusyjne
                </h1>
                <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
                    Witaj na forum społeczności RenoTech. Wybierz kategorię poniżej, aby
                    dołączyć do dyskusji, zadawać pytania i dzielić się wiedzą.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {categories.map((category) => (
                    <Link
                        key={category.id}
                        href={`/forum/${category.slug}`}
                        className="group relative overflow-hidden bg-zinc-900/50 border border-white/5 rounded-xl p-6 transition-all duration-300 hover:bg-zinc-900/80 hover:border-red-600/30 hover:shadow-lg hover:shadow-red-900/10 flex flex-col h-full"
                    >
                        <div className="absolute top-0 left-0 w-1 h-full bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        <div className="mb-4 p-3 bg-zinc-950/50 rounded-lg w-fit text-red-500 group-hover:text-red-400 group-hover:scale-110 transition-all duration-300">
                            <MessageSquare className="w-8 h-8" />
                        </div>

                        <h2 className="text-xl font-semibold text-zinc-100 mb-2 group-hover:text-white transition-colors">
                            {category.name}
                        </h2>

                        <p className="text-zinc-400 text-sm leading-relaxed flex-grow">
                            {category.description || "Brak opisu dla tej kategorii."}
                        </p>

                        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors hidden">
                            {/* Placeholder for stats like "120 tematów" if available later */}
                            <span>Zobacz tematy &rarr;</span>
                        </div>
                    </Link>
                ))}

                {categories.length === 0 && (
                    <div className="col-span-full text-center py-20 bg-zinc-900/30 rounded-xl border border-white/5 border-dashed">
                        <h3 className="text-xl font-medium text-zinc-300 mb-2">
                            Brak kategorii forum
                        </h3>
                        <p className="text-zinc-500">
                            Obecnie nie ma żadnych dostępnych kategorii.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
