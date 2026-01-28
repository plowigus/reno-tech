"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { Button } from "@/components/ui/button";
import { Bold, Italic, Strikethrough, Code, List, ListOrdered, Quote, Heading2, Link as LinkIcon, Unlink } from "lucide-react";
import { useState, useEffect } from "react";

const Toolbar = ({ editor }: { editor: any }) => {
    if (!editor) return null;

    const setLink = () => {
        const previousUrl = editor.getAttributes("link").href;
        const url = window.prompt("URL", previousUrl);

        // cancelled
        if (url === null) {
            return;
        }

        // empty
        if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
        }

        // update
        editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    };

    const buttons = [
        { icon: Bold, action: () => editor.chain().focus().toggleBold().run(), active: "bold" },
        { icon: Italic, action: () => editor.chain().focus().toggleItalic().run(), active: "italic" },
        { icon: Strikethrough, action: () => editor.chain().focus().toggleStrike().run(), active: "strike" },
        { icon: Code, action: () => editor.chain().focus().toggleCode().run(), active: "code" },
        { icon: Heading2, action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: "heading", level: 2 },
        { icon: List, action: () => editor.chain().focus().toggleBulletList().run(), active: "bulletList" },
        { icon: ListOrdered, action: () => editor.chain().focus().toggleOrderedList().run(), active: "orderedList" },
        { icon: Quote, action: () => editor.chain().focus().toggleBlockquote().run(), active: "blockquote" },
        {
            icon: LinkIcon,
            action: setLink,
            active: "link"
        },
    ];

    return (
        <div className="flex flex-wrap gap-1 p-2 bg-zinc-900 border-b border-zinc-800 rounded-t-md">
            {buttons.map((btn, idx) => (
                <Button
                    key={idx}
                    type="button" // Prevent form submission
                    variant="ghost"
                    size="sm"
                    onClick={btn.action}
                    className={`h-8 w-8 p-0 ${editor.isActive(btn.active, btn.level) ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white hover:bg-zinc-800"}`}
                    title={btn.active}
                >
                    <btn.icon className="w-4 h-4" />
                </Button>
            ))}
        </div>
    );
};

export default function RichTextEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-red-500 underline hover:text-red-400',
                }
            })
        ],
        content: value,
        editorProps: {
            attributes: {
                class: "prose prose-invert max-w-none min-h-[200px] p-4 focus:outline-none text-zinc-300 text-sm",
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        immediatelyRender: false // Fixes some SSR hydration mismatches
    });

    // Handle external value changes (e.g. form reset) if needed, 
    // but usually for a controlled input like this we rely on the parent or initial value.
    // Ideally if `value` changes from parent we should update editor, 
    // but that can cause loops if not careful. For this simple case, `initialContent` is enough usually,
    // OR we use a useEffect.
    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            // Check if content is truly different to avoid cursor jumps or re-renders?
            // For now, assume this is mostly for Initial render or Reset.
            if (editor.getText() === "" && value === "") {
                // do nothing
            } else if (value === "" && editor.getText() !== "") {
                editor.commands.clearContent();
            }
        }
    }, [value, editor]);

    return (
        <div className="border border-zinc-800 rounded-md overflow-hidden bg-zinc-950 focus-within:ring-1 focus-within:ring-red-600 transition-all">
            <Toolbar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    );
}
