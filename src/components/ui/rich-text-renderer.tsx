export function RichTextRenderer({ content }: { content: string }) {
    return (
        <div
            className="prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-800 text-zinc-300 text-sm [&_a]:text-red-500 [&_a]:underline hover:[&_a]:text-red-400"
            dangerouslySetInnerHTML={{ __html: content }}
        />
    );
}
