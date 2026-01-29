
"use client";

import { createPostAction } from "@/app/actions/forum-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import RichTextEditor from "@/components/ui/rich-text-editor"; // Import Editor
import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { useState } from "react";

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold px-8" disabled={pending}>
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publikowanie...
                </>
            ) : (
                "Opublikuj"
            )}
        </Button>
    );
}

export function CreateTopicForm({ categoryId, slug }: { categoryId: string, slug: string }) {
    const [content, setContent] = useState(""); // State for editor content

    async function clientAction(formData: FormData) {
        const result = await createPostAction(categoryId, formData);
        if (result?.error) {
            alert(result.error);
        } else {
            setContent("");
        }
    }

    return (
        <form action={clientAction} className="space-y-6 max-w-3xl">
            <div className="space-y-2">
                <Label htmlFor="title" className="text-zinc-300">Tytuł tematu</Label>
                <Input
                    id="title"
                    name="title"
                    placeholder="Krótko opisz swój problem..."
                    className="bg-zinc-950 border-zinc-800 focus-visible:ring-red-600 text-white placeholder:text-zinc-600"
                    required
                    minLength={5}
                    maxLength={100}
                />
                <p className="text-[10px] text-zinc-500">Min. 5 znaków. Bądź konkretny.</p>
            </div>

            <div className="space-y-2">
                <Label className="text-zinc-300">Treść wiadomości</Label>
                {/* Hidden Input for Server Action */}
                <input type="hidden" name="content" value={content} />

                <RichTextEditor
                    value={content}
                    onChange={setContent}
                />

                <p className="text-[10px] text-zinc-500">Możesz używać Markdown.</p>
            </div>

            <div className="flex justify-end gap-4 pt-4">
                <Link href={`/forum/${slug}`}>
                    <Button variant="ghost" type="button" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                        Anuluj
                    </Button>
                </Link>
                <SubmitButton />
            </div>
        </form>
    );
}
