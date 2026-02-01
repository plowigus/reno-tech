import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getMessages } from "@/app/actions/chat-actions";
import { ChatWindow } from "@/components/chat/ChatWindow";

export default async function ConversationPage({ params }: { params: Promise<{ conversationId: string }> }) {
    const session = await auth();
    if (!session) redirect("/login");
    const { conversationId } = await params
    const messages = await getMessages(conversationId);

    return (
        <ChatWindow
            conversationId={conversationId}
            initialMessages={messages as any}
            currentUserId={session.user.id!}
        />
    );
}
