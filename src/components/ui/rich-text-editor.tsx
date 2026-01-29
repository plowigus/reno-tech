"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Youtube from "@tiptap/extension-youtube";
import { Button } from "@/components/ui/button";
import {
    Bold, Italic, Strikethrough, Code, List, ListOrdered,
    Quote, Heading2, Link as LinkIcon, Youtube as YoutubeIcon, Unlink
} from "lucide-react";
import { useEffect } from "react";

const Toolbar = ({ editor }: { editor: any }) => {
    if (!editor) return null;

    const addLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('Wklej adres URL:', previousUrl);

        // cancelled
        if (url === null) return;

        // empty
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        // update
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    const addYoutube = () => {
        const url = window.prompt('Wklej link do YouTube:');
        if (url) {
            editor.commands.setYoutubeVideo({ src: url });
        }
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
        { icon: LinkIcon, action: addLink, active: "link" },
        { icon: YoutubeIcon, action: addYoutube, active: "youtube" },
    ];

    return (
        <div className="flex flex-wrap gap-1 p-2 bg-zinc-900 border-b border-zinc-800 rounded-t-md">
            {buttons.map((btn, idx) => (
                <Button
                    key={idx}
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={btn.action}
                    className={`h-8 w-8 p-0 ${editor.isActive(btn.active, btn.level) ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white hover:bg-zinc-800"}`}
                >
                    <btn.icon className="w-4 h-4" />
                </Button>
            ))}
            {editor.isActive('link') && (
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().unsetLink().run()}
                    className="h-8 w-8 p-0 text-red-400 hover:bg-zinc-800"
                    title="Usuń link"
                >
                    <Unlink className="w-4 h-4" />
                </Button>
            )}
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
                autolink: true,
                defaultProtocol: 'https',
            }),
            Youtube.configure({
                controls: false,
                nocookie: true,
            }),
        ],
        content: value,
        editorProps: {
            attributes: {
                // Added prose-a styles for visibility
                class: "prose prose-invert max-w-none min-h-[200px] p-4 focus:outline-none text-zinc-300 text-sm prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline",
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        immediatelyRender: false
    });

    // Listen for external reset (empty string)
    useEffect(() => {
        if (editor && value === "") {
            editor.commands.clearContent();
        }
    }, [editor, value]);

    return (
        <div className="border border-zinc-800 rounded-md overflow-hidden bg-zinc-950 focus-within:ring-1 focus-within:ring-red-600 transition-all">
            <Toolbar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    );
}
