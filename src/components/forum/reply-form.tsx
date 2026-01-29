
"use client";

import { createCommentAction } from "@/app/actions/forum-actions";
import { Button } from "@/components/ui/button";
import RichTextEditor from "@/components/ui/rich-text-editor";
import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { useState, useEffect } from "react";

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
    const [content, setContent] = useState("");


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
            setContent(""); // Reset editor content on success
        }
    }

    // Handle Quote Event
    useEffect(() => {
        const handleQuote = (e: any) => {
            const quoteHtml = e.detail;
            if (content) {
                setContent((prev) => prev + quoteHtml);
            } else {
                setContent(quoteHtml);
            }
        };

        window.addEventListener("forum:quote", handleQuote);
        return () => window.removeEventListener("forum:quote", handleQuote);
    }, [content]);

    return (
        <form id="reply-form" action={clientAction} className="space-y-4">
            <input type="hidden" name="content" value={content} />
            <RichTextEditor
                value={content}
                onChange={setContent}
            />
            <div className="flex justify-end">
                <SubmitButton />
            </div>
        </form>
    );
}
