"use client";

import { useState } from "react";
import Image from "next/image";
import { formatDatePL } from "@/lib/utils";
import { PostActions } from "@/components/forum/PostActions";
import RichTextEditor from "@/components/ui/rich-text-editor";
import { Button } from "@/components/ui/button";
import { updateComment } from "@/app/actions/forum-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Check, X, Loader2 } from "lucide-react";

interface ForumPostProps {
    comment: {
        id: string;
        content: string;
        createdAt: Date | string;
        updatedAt?: Date | string | null;
        authorId: string;
        author: {
            name: string | null;
            image: string | null;
            role?: string | null;
        } | null;
    };
    currentUser: {
        id: string;
        role: string;
    } | undefined;
}

export function ForumPost({ comment, currentUser }: ForumPostProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [content, setContent] = useState(comment.content);
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();

    // Safely access author props
    const authorName = comment.author?.name || "Użytkownik";
    const authorImage = comment.author?.image;
    const authorRole = comment.author?.role;

    const isOwner = currentUser?.id === comment.authorId;
    const isAdmin = currentUser?.role === "admin" || currentUser?.role === "moderator";

    const handleSave = async () => {
        try {
            setIsSaving(true);
            const res = await updateComment(comment.id, content);

            if (res?.error) {
                toast.error(res.error);
            } else {
                toast.success("Post zaktualizowany!");
                setIsEditing(false);
                router.refresh();
            }
        } catch (error) {
            toast.error("Błąd zapisu.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setContent(comment.content);
        setIsEditing(false);
    };

    return (
        <div id={comment.id} className="flex gap-4 p-6 border-b border-zinc-800/50 hover:bg-zinc-900/20 transition-colors group">
            {/* 1. AWATAR AUTORA */}
            <div className="flex flex-col items-center gap-2 min-w-[60px]">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-zinc-700 bg-zinc-800">
                    {authorImage ? (
                        <Image src={authorImage} alt="Avatar" fill className="object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-500 text-xs font-bold">
                            {authorName.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
                {/* Opcjonalnie: Rola */}
                {authorRole === 'admin' && (
                    <span className="text-[9px] bg-red-600/20 text-red-500 px-1.5 py-0.5 rounded border border-red-600/30 uppercase font-bold tracking-wider">
                        Admin
                    </span>
                )}
            </div>

            {/* 2. TREŚĆ I NAGŁÓWEK */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-zinc-200 text-sm">
                            {authorName}
                        </span>
                        <span className="text-xs text-zinc-500">
                            {formatDatePL(comment.createdAt)}
                        </span>
                        {comment.updatedAt && (
                            <span className="text-[10px] text-zinc-600 italic ml-1">
                                (edytowano)
                            </span>
                        )}
                    </div>
                </div>

                {/* TRYB EDYCJI vs TRYB CZYTANIA */}
                {isEditing ? (
                    <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
                        <RichTextEditor value={content} onChange={setContent} />
                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                onClick={handleSave}
                                disabled={isSaving}
                                className="bg-green-600 hover:bg-green-700 text-white h-8"
                            >
                                {isSaving ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Check className="w-3 h-3 mr-1" />}
                                Zapisz
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleCancel}
                                disabled={isSaving}
                                className="h-8 hover:bg-zinc-800"
                            >
                                <X className="w-3 h-3 mr-1" />
                                Anuluj
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div
                        className="prose prose-invert max-w-none text-sm text-zinc-300 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: comment.content }}
                    />
                )}

                {/* PRZYCISKI AKCJI (Tylko w trybie czytania) */}
                {!isEditing && (
                    <PostActions
                        postId={comment.id}
                        authorName={authorName}
                        contentHtml={comment.content}
                        isOwner={isOwner}
                        isAdmin={isAdmin}
                        type="COMMENT" // Hardcoded as we use this for comments loop
                        onEdit={() => {
                            setContent(comment.content); // Reset przed edycją
                            setIsEditing(true);
                        }}
                    />
                )}
            </div>
        </div>
    );
}
