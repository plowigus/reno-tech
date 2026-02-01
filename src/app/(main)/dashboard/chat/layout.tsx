import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getConversations } from "@/app/actions/chat-actions";
import { ChatSidebar } from "@/components/chat/ChatSidebar";

export default async function ChatLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();
    if (!session) redirect("/login");

    // Fetch initial conversations on server
    const conversations = await getConversations();

    return (
        <div className="flex flex-col md:flex-row w-full h-full bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800">
            <ChatSidebar conversations={conversations as any} />
            <div className="flex-1 h-full bg-zinc-950/50">
                {children}
            </div>
        </div>
    );
}
