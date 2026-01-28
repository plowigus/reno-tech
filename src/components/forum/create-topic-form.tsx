"use client";

import { createPostAction } from "@/app/actions/forum-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useActionState } from "react";


import { useFormStatus } from "react-dom";

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white" disabled={pending}>
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publikowanie...
                </>
            ) : (
                "Opublikuj temat"
            )}
        </Button>
    );
}

export function CreateTopicForm({ categoryId }: { categoryId: string }) {

    const createPostWithId = createPostAction.bind(null, categoryId);
    async function clientAction(formData: FormData) {
        const result = await createPostAction(categoryId, formData);
        if (result?.error) {
            alert(result.error); // Simple error handling for now as requested "clean form".
        }
    }

    return (
        <form action={clientAction} className="space-y-6 bg-zinc-900/50 p-6 rounded-xl border border-white/5">
            <div className="space-y-2">
                <Label htmlFor="title" className="text-zinc-300">
                    Tytuł tematu
                </Label>
                <Input
                    id="title"
                    name="title"
                    placeholder="np. Problem z silnikiem 1.6 dCi"
                    required
                    minLength={5}
                    maxLength={100}
                    className="bg-zinc-950 border-white/10 focus:border-red-600/50"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="content" className="text-zinc-300">
                    Treść
                </Label>
                <Textarea
                    id="content"
                    name="content"
                    placeholder="Opisz dokładnie swój problem..."
                    required
                    minLength={20}
                    className="min-h-[200px] bg-zinc-950 border-white/10 focus:border-red-600/50 resize-y"
                />
            </div>

            <SubmitButton />
        </form>
    );
}
