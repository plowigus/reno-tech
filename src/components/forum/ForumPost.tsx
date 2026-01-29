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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { RichTextRenderer } from "@/components/ui/rich-text-renderer";

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
            createdAt?: Date | string | null;
        } | null;
    };
    currentUser: {
        id: string;
        role: string;
    } | undefined;
    // Visual props
    index?: number;
    userPostCount?: number;
    isMainPost?: boolean;
}

export function ForumPost({
    comment,
    currentUser,
    index = 1,
    userPostCount = 0,
    isMainPost = false,
}: ForumPostProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [content, setContent] = useState(comment.content);
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();

    // Safely access author props
    const authorName = comment.author?.name || "Użytkownik";
    const authorImage = comment.author?.image;
    const authorRole = comment.author?.role;
    // Fix author.createdAt type handling
    const authorJoinedDate = comment.author?.createdAt
        ? (typeof comment.author.createdAt === 'string' ? new Date(comment.author.createdAt) : comment.author.createdAt)
        : undefined;

    const createdAtDate = typeof comment.createdAt === 'string' ? new Date(comment.createdAt) : comment.createdAt;

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
        <div id={comment.id} className={`mb-4 border border-zinc-800 rounded-md overflow-hidden ${isMainPost ? "bg-zinc-900/60 shadow-md" : "bg-zinc-900/20"}`}>
            {/* POST HEADER BAR (Mobile Only / Top bar info) */}
            <div className="md:hidden bg-zinc-900 p-3 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8 md:w-10 md:h-10">
                        <AvatarImage src={authorImage || undefined} />
                        <AvatarFallback>{(authorName || "U")?.[0]}</AvatarFallback>
                    </Avatar>
                    <span className={`font-bold ${isMainPost ? "text-red-500" : "text-zinc-200"}`}>{authorName}</span>
                </div>
                <span className="text-xs text-zinc-500">{formatDatePL(createdAtDate, "dd MMM yyyy")}</span>
            </div>

            <div className="flex flex-col md:flex-row">
                {/* LEFT COLUMN: USER INFO (Desktop Sidebar) */}
                <div className="hidden md:flex w-48 flex-col items-center p-6 bg-zinc-900/50 border-r border-zinc-800 text-center gap-3">
                    <Avatar className="w-20 h-20 border-2 border-zinc-800 shadow-xl">
                        <AvatarImage src={authorImage || undefined} />
                        <AvatarFallback className="text-2xl bg-zinc-800 text-zinc-400">{(authorName || "U")?.[0].toUpperCase()}</AvatarFallback>
                    </Avatar>

                    <div className="space-y-1">
                        <div className={`font-bold text-lg ${isMainPost ? "text-red-500" : "text-white"}`}>
                            {authorName}
                        </div>
                        {/* Role Badge */}
                        {(authorRole === "admin" || authorRole === "moderator") && (
                            <Badge variant="outline" className="border-zinc-700 text-zinc-400 text-[10px] uppercase">
                                {authorRole === "admin" ? "ADMIN" : "MODERATOR"}
                            </Badge>
                        )}
                        {!authorRole && (
                            <Badge variant="outline" className="border-zinc-700 text-zinc-400 text-[10px] uppercase">
                                Użytkownik
                            </Badge>
                        )}
                    </div>

                    <div className="w-full h-px bg-zinc-800 my-2" />

                    <div className="text-xs text-zinc-500 space-y-1">
                        <p>Dołączył:</p>
                        <p className="text-zinc-400">
                            {authorJoinedDate ? formatDatePL(authorJoinedDate, "yyyy-MM-dd") : "Nieznana"}
                        </p>
                        <p>Postów: <span className="text-zinc-300">{userPostCount}</span></p>
                    </div>
                </div>

                {/* RIGHT COLUMN: CONTENT */}
                <div className="flex-1 flex flex-col min-h-[200px]">
                    {/* Desktop Post Header */}
                    <div className="hidden md:flex justify-between items-center p-3 border-b border-zinc-800/50 text-xs text-zinc-500 bg-zinc-900/30">
                        <div className="flex items-center gap-2">
                            <span>Wysłany: {formatDatePL(createdAtDate, "d MMMM yyyy, HH:mm")}</span>
                            {comment.updatedAt && <span className="text-zinc-600 italic">(edytowano)</span>}
                        </div>
                        <span className="opacity-50">#{index}</span>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 p-6 text-zinc-300 leading-relaxed min-h-[100px]">
                        {isEditing ? (
                            <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
                                <RichTextEditor value={content} onChange={setContent} />
                                <div className="flex items-center gap-2 justify-end">
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
                                    <Button
                                        size="sm"
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="bg-green-600 hover:bg-green-700 text-white h-8"
                                    >
                                        {isSaving ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Check className="w-3 h-3 mr-1" />}
                                        Zapisz
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <RichTextRenderer content={comment.content} />
                        )}
                    </div>

                    {/* Footer / Actions */}
                    {!isEditing && (
                        <div className="p-3 border-t border-zinc-800/50 flex justify-end gap-2 bg-zinc-900/30">
                            <PostActions
                                postId={comment.id}
                                authorName={authorName}
                                contentHtml={comment.content}
                                isOwner={isOwner}
                                isAdmin={isAdmin}
                                type={isMainPost ? "TOPIC" : "COMMENT"}
                                onEdit={() => {
                                    setContent(comment.content);
                                    setIsEditing(true);
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
