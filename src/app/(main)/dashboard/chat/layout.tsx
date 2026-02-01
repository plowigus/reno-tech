import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getConversations } from "@/app/actions/chat-actions";
import { getFriends } from "@/app/actions/friend-actions";
import { ChatSidebar } from "@/components/chat/ChatSidebar";

export default async function ChatLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();
    if (!session) redirect("/login");

    // Fetch initial conversations and friends on server
    const [conversations, friends] = await Promise.all([
        getConversations(),
        getFriends()
    ]);

    return (
        <div className="flex flex-col md:flex-row w-full h-full bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800">
            <ChatSidebar
                conversations={conversations as any}
                friends={friends as any}
                currentUserId={session.user.id!}
            />
            <div className="flex-1 h-full bg-zinc-950/50">
                {children}
            </div>
        </div>
    );
}
