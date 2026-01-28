
"use client";

import { createCommentAction } from "@/app/actions/forum-actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <Button
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-8"
            disabled={pending}
        >
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Wysyłanie...
                </>
            ) : (
                "Wyślij odpowiedź"
            )}
        </Button>
    );
}

export function ReplyForm({ postId }: { postId: string }) {

    async function clientAction(formData: FormData) {
        const result = await createCommentAction(postId, formData);
        if (result?.error) {
            alert(result.error);
        } else {
            // Optional: clear form on success, though standard action might revalidate path and reset page.
            // If the form doesn't clear, we might need a ref to the form element to reset it.
            // For now, let's assume revalidation handles the UX or user submits and page refreshes.
            // However, uncontrolled inputs don't reset automatically on server revalidate unless page fully reloads.
            // To be nice, let's reset the form.
            const form = document.getElementById("reply-form") as HTMLFormElement;
            if (form) form.reset();
        }
    }

    return (
        <form id="reply-form" action={clientAction} className="space-y-4">
            <Textarea
                name="content"
                placeholder="Napisz swoją odpowiedź..."
                className="bg-zinc-950 border-zinc-800 min-h-[150px] focus-visible:ring-red-600 font-mono text-sm"
                required
            />
            <div className="flex justify-end">
                <SubmitButton />
            </div>
        </form>
    );
}
