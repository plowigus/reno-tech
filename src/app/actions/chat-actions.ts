"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { conversations, messages, conversationParticipants, friends } from "@/db/schema";
import { pusherServer } from "@/lib/pusher";
import { eq, and, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// --- EMERGENCY RESET ---
export async function resetChatSystem() {
    const session = await auth();
    // Optional: Add admin check here if needed
    if (!session?.user) return { error: "Unauthorized" };

    try {
        // Deleting conversations cascades to messages and participants
        await db.delete(conversations);
        revalidatePath("/");
        return { success: "Czat wyczyszczony." };
    } catch (e) {
        return { error: "Błąd resetowania." };
    }
}

// --- SEND MESSAGE ---
export async function sendMessage(conversationId: string, content: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    try {
        const [newMessage] = await db.insert(messages).values({
            conversationId,
            senderId: session.user.id,
            content,
        }).returning();

        await db.update(conversations)
            .set({ lastMessageAt: new Date() })
            .where(eq(conversations.id, conversationId));

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
    } catch (error) {
        console.error("Chat Error:", error);
        return { error: "Failed to send message" };
    }
}

// --- GET CONVERSATIONS ---
export async function getConversations() {
    const session = await auth();
    if (!session?.user?.id) return [];

    const userConvos = await db.query.conversationParticipants.findMany({
        where: eq(conversationParticipants.userId, session.user.id),
        with: {
            conversation: {
                with: {
                    participants: {
                        with: {
                            user: { columns: { id: true, name: true, image: true } }
                        }
                    },
                    messages: {
                        orderBy: [desc(messages.createdAt)],
                        limit: 1,
                    }
                }
            }
        }
    });

    return userConvos.map(item => {
        const convo = item.conversation;
        const otherUser = convo.participants.find(p => p.user.id !== session.user.id)?.user;

        return {
            id: convo.id,
            isGroup: convo.isGroup,
            name: convo.name || otherUser?.name || "Użytkownik",
            image: otherUser?.image,
            otherUserId: otherUser?.id,
            lastMessage: convo.messages[0],
            lastMessageAt: convo.lastMessageAt,
        };
    }).sort((a, b) => new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime());
}

// --- GET MESSAGES ---
export async function getMessages(conversationId: string) {
    const session = await auth();
    if (!session?.user?.id) return [];

    const isParticipant = await db.query.conversationParticipants.findFirst({
        where: and(
            eq(conversationParticipants.conversationId, conversationId),
            eq(conversationParticipants.userId, session.user.id)
        )
    });

    if (!isParticipant) return [];

    return await db.query.messages.findMany({
        where: eq(messages.conversationId, conversationId),
        orderBy: [desc(messages.createdAt)],
        limit: 50,
        with: {
            sender: { columns: { id: true, name: true, image: true } }
        }
    });
}

// --- START CONVERSATION (FIXED DUPLICATES) ---
export async function startConversation(targetUserId: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    // 1. Friend Check
    const isFriend = await db.query.friends.findFirst({
        where: and(
            eq(friends.userId, session.user.id),
            eq(friends.friendId, targetUserId)
        )
    });
    if (!isFriend) return { error: "Najpierw dodaj do znajomych." };

    // 2. Duplicate Check (SQL EXISTS)
    const existing = await db
        .select({ id: conversations.id })
        .from(conversations)
        .where(and(
            eq(conversations.isGroup, false),
            sql`EXISTS (SELECT 1 FROM ${conversationParticipants} cp WHERE cp.conversation_id = ${conversations.id} AND cp.user_id = ${session.user.id})`,
            sql`EXISTS (SELECT 1 FROM ${conversationParticipants} cp WHERE cp.conversation_id = ${conversations.id} AND cp.user_id = ${targetUserId})`
        ))
        .limit(1);

    if (existing.length > 0) {
        return { success: true, conversationId: existing[0].id };
    }

    // 3. Create New
    const [newConvo] = await db.insert(conversations).values({ isGroup: false }).returning();

    await db.insert(conversationParticipants).values([
        { conversationId: newConvo.id, userId: session.user.id },
        { conversationId: newConvo.id, userId: targetUserId }
    ]);

    revalidatePath("/dashboard/chat");
    return { success: true, conversationId: newConvo.id };
}
