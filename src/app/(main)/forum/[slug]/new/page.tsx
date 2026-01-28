
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreateTopicForm } from "@/components/forum/create-topic-form";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { forumCategories } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function NewTopicPage({ params }: { params: Promise<{ slug: string }> }) {
    const session = await auth();
    if (!session) redirect("/login");

    const { slug } = await params;

    // Fetch category name for the header/breadcrumb
    const category = await db.query.forumCategories.findFirst({
        where: eq(forumCategories.slug, slug),
    });

    if (!category) return <div>Kategoria nie istnieje</div>;

    return (
        <div className="min-h-screen bg-background pt-32 pb-12 px-4">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header / Nav */}
                <div className="flex items-center gap-4">
                    <Link href={`/forum/${slug}`}>
                        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Nowy temat</h1>
                        <p className="text-sm text-zinc-400">Dział: <span className="text-red-500">{category.name}</span></p>
                    </div>
                </div>

                {/* Form Card */}
                <Card className="bg-zinc-900/40 border-zinc-800">
                    <CardHeader className="border-b border-zinc-800 pb-4">
                        <CardTitle className="text-lg text-zinc-200">Szczegóły tematu</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <CreateTopicForm categoryId={category.id} slug={slug} />
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
