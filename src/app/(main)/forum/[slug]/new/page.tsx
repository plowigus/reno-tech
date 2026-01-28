import { auth } from "@/auth";
import { db } from "@/db";
import { forumCategories } from "@/db/schema";
import { CreateTopicForm } from "@/components/forum/create-topic-form";
import { eq } from "drizzle-orm";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function CreateTopicPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    const category = await db.query.forumCategories.findFirst({
        where: eq(forumCategories.slug, slug),
    });

    if (!category) {
        notFound();
    }

    return (
        <div className="container py-10 max-w-2xl mx-auto">
            <div className="mb-6">
                <Link
                    href={`/forum/${slug}`}
                    className="inline-flex items-center text-sm text-zinc-400 hover:text-red-500 transition-colors mb-4"
                >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Wróć do kategorii {category.name}
                </Link>
                <h1 className="text-3xl font-bold text-white">Rozpocznij dyskusję</h1>
                <p className="text-zinc-600 mt-2">
                    Zadaj pytanie lub podziel się wiedzą w kategorii <span className="text-red-500">{category.name}</span>.
                </p>
            </div>

            <CreateTopicForm categoryId={category.id} />
        </div>
    );
}
