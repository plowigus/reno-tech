"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { conversations, messages, conversationParticipants, users } from "@/db/schema";
import { pusherServer } from "@/lib/pusher";
import { eq, and, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// 1. Send a Message
export async function sendMessage(conversationId: string, content: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    try {
        // A. Save to Database
        const [newMessage] = await db.insert(messages).values({
            conversationId,
            senderId: session.user.id,
            content,
        }).returning();

        // B. Update Conversation Timestamp
        await db.update(conversations)
            .set({ lastMessageAt: new Date() })
            .where(eq(conversations.id, conversationId));

        // C. Trigger Pusher Event (Real-Time!)
        // Channel: conversation-[id]
        // Event: new-message
        await pusherServer.trigger(
            `conversation-${conversationId}`,
            "new-message",
            {
                id: newMessage.id,
                content: newMessage.content,
                senderId: session.user.id,
                createdAt: newMessage.createdAt,
                senderName: session.user.name,
                senderImage: session.user.image,
            }
        );

        return { success: true, message: newMessage };
    } catch (error: any) {
        console.error("Chat Error:", error);
        return { error: error.message || "Failed to send message" };
    }
}

// 2. Get My Conversations (for Sidebar)
export async function getConversations() {
    const session = await auth();
    if (!session?.user?.id) return [];

    // This query fetches conversations where the current user is a participant
    // It also needs to fetch the 'other' participant's details for the UI (Avatar/Name)

    // Simplified logic for MVP:
    // 1. Get conversation IDs for user
    const userConvos = await db.query.conversationParticipants.findMany({
        where: eq(conversationParticipants.userId, session.user.id),
        columns: { conversationId: true },
        with: {
            conversation: {
                with: {
                    participants: {
                        with: {
                            user: {
                                columns: { id: true, name: true, image: true, role: true } // Fetch 'status' logic later via Pusher
                            }
                        }
                    },
                    messages: {
                        orderBy: [desc(messages.createdAt)],
                        limit: 1, // Last message preview
                    }
                }
            }
        }
    });

    // Transform data for easier UI consumption
    const formatted = userConvos.map(item => {
        const convo = item.conversation;
        // Find the participant that is NOT me (for 1-on-1 chats)
        const otherUser = convo.participants.find(p => p.user.id !== session.user.id)?.user;

        return {
            id: convo.id,
            isGroup: convo.isGroup,
            name: convo.name || otherUser?.name || "Użytkownik",
            image: otherUser?.image,
            otherUserId: otherUser?.id, // Key for checking Online status later
            lastMessage: convo.messages[0],
            lastMessageAt: convo.lastMessageAt,
        };
    }).sort((a, b) => {
        // Sort by latest activity
        return new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime();
    });

    return formatted;
}

// 3. Get Messages for a specific Conversation
export async function getMessages(conversationId: string) {
    const session = await auth();
    if (!session?.user?.id) return [];

    // Verify participation (Security)
    const isParticipant = await db.query.conversationParticipants.findFirst({
        where: and(
            eq(conversationParticipants.conversationId, conversationId),
            eq(conversationParticipants.userId, session.user.id)
        )
    });

    if (!isParticipant) return [];

    return await db.query.messages.findMany({
        where: eq(messages.conversationId, conversationId),
        orderBy: [desc(messages.createdAt)], // Oldest first is usually better for chat history render (reversed flex), but let's stick to desc for fetching
        limit: 50,
        with: {
            sender: {
                columns: { id: true, name: true, image: true }
            }
        }
    });
}

// 4. Create or Get Conversation (Start Chat)
export async function startConversation(targetUserId: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    // A. Check if conversation already exists between these 2 users (1-on-1)
    // Complex query: Find a conversation where BOTH users are participants AND it is NOT a group
    // For MVP/Simplicity: We will create a new one or you can implement the check logic.

    // Let's create a NEW one for now to ensure it works. 
    // Optimization: Check for existing convo later.

    const newConvo = await db.insert(conversations).values({
        isGroup: false,
    }).returning();

    const convoId = newConvo[0].id;

    // Add Me
    await db.insert(conversationParticipants).values({
        conversationId: convoId,
        userId: session.user.id
    });

    // Add Them
    await db.insert(conversationParticipants).values({
        conversationId: convoId,
        userId: targetUserId
    });

    revalidatePath("/dashboard/chat");
    return { success: true, conversationId: convoId };
}
