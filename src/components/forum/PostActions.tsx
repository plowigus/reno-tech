"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    MessageSquareQuote,
    Flag,
    Trash2,
    Pencil,
    Loader2
} from "lucide-react";
import { deleteTopic, deleteComment } from "@/app/actions/forum-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { AlertModal } from "@/components/ui/alert-modal";

interface PostActionsProps {
    postId: string;
    authorName: string;
    contentHtml: string; // The raw content to quote
    isOwner: boolean;
    isAdmin: boolean;
    type: "TOPIC" | "COMMENT"; // Distinguish to pick correct action
    onEdit?: () => void; // Callback to trigger edit mode
}

export function PostActions({
    postId,
    authorName,
    contentHtml,
    isOwner,
    isAdmin,
    type,
    onEdit
}: PostActionsProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        try {
            setIsLoading(true);
            const action = type === "TOPIC" ? deleteTopic : deleteComment;
            const res = await action(postId);

            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success(type === "TOPIC" ? "Temat usunięty." : "Komentarz usunięty.");
                router.refresh();
            }
        } catch (error) {
            toast.error("Wystąpił błąd.");
        } finally {
            setIsLoading(false);
            setShowDeleteAlert(false);
        }
    };

    const handleQuote = () => {
        // Dispatch event for RichTextEditor to catch
        // We wrap content in blockquote
        const quoteHtml = `<blockquote><strong>${authorName} napisał(a):</strong><br/>${contentHtml}</blockquote><p></p>`;

        // Dispatch event for any component listening (ReplyForm's editor)
        const event = new CustomEvent("forum:quote", { detail: quoteHtml });
        window.dispatchEvent(event);

        // Scroll to editor
        const editor = document.getElementById("reply-form");
        if (editor) {
            editor.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <>
            <div className="flex items-center gap-2 mt-2">
                {/* STANDARD ACTIONS (Visible to everyone) */}
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-zinc-400 hover:text-white hover:bg-zinc-800"
                    onClick={handleQuote}
                >
                    <MessageSquareQuote className="w-4 h-4 mr-1.5" />
                    Cytuj
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-zinc-400 hover:text-red-400 hover:bg-zinc-800"
                    onClick={() => toast.info("Zgłoszenie wysłane do moderacji.")}
                >
                    <Flag className="w-4 h-4 mr-1.5" />
                    Zgłoś
                </Button>

                {/* ADMIN / OWNER ACTIONS */}
                {(isOwner || isAdmin) && (
                    <div className="flex items-center gap-2 ml-auto">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-zinc-400 hover:text-blue-400 hover:bg-zinc-800"
                            onClick={onEdit}
                        >
                            <Pencil className="w-4 h-4 mr-1.5" />
                            Edytuj
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-zinc-400 hover:text-red-500 hover:bg-zinc-800"
                            onClick={() => setShowDeleteAlert(true)}
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 mr-1.5" />}
                            Usuń
                        </Button>
                    </div>
                )}
            </div>

            {/* DELETE CONFIRMATION MODAL */}
            <AlertModal
                isOpen={showDeleteAlert}
                onClose={() => setShowDeleteAlert(false)}
                onConfirm={handleDelete}
                loading={isLoading}
                title={type === "TOPIC" ? "Usunąć temat?" : "Usunąć komentarz?"}
                description="Tej operacji nie można cofnąć."
            />
        </>
    );
}
