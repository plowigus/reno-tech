import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getMessages, getConversationDetails } from "@/app/actions/chat-actions";
import { ChatWindow } from "@/components/chat/ChatWindow";

export default async function ConversationPage({ params }: { params: Promise<{ conversationId: string }> }) {
    const session = await auth();
    if (!session) redirect("/login");
    const { conversationId } = await params

    // Fetch parallel
    const [messages, details] = await Promise.all([
        getMessages(conversationId),
        getConversationDetails(conversationId)
    ]);

    return (
        <ChatWindow
            conversationId={conversationId}
            initialMessages={messages as any}
            currentUserId={session.user.id!}
            partner={details?.partner}
        />
    );
}
