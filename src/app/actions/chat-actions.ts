"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { conversations, messages, conversationParticipants, friends, messageReactions, users } from "@/db/schema";
import { pusherServer } from "@/lib/pusher";
import { eq, and, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const sendMessageSchema = z.object({
    conversationId: z.string().min(1),
    content: z.string().min(1),
});

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
    console.log("[sendMessage] Action started", { conversationId, content });
    const session = await auth();
    if (!session?.user?.id) {
        console.log("[sendMessage] Unauthorized: No session");
        return { error: "Unauthorized" };
    }

    try {
        const validatedFields = sendMessageSchema.safeParse({ conversationId, content });
        if (!validatedFields.success) {
            console.error("[sendMessage] Validation Error:", validatedFields.error);
            return { error: "Invalid data." };
        }

        const senderId = session.user.id;

        // Fetch fresh user data to ensure image is up-to-date
        // Using db.query.users.findFirst for cleaner syntax with relations support if needed, 
        // but simple select is fine too.
        const sender = await db.query.users.findFirst({
            where: eq(users.id, senderId),
            columns: {
                id: true,
                name: true,
                image: true
            }
        });

        if (!sender) {
            return { error: "Nie znaleziono użytkownika" };
        }

        console.log("[sendMessage] Inserting message to DB...");
        const [newMessage] = await db.insert(messages).values({
            conversationId,
            senderId: sender.id,
            content,
        }).returning();
        console.log("[sendMessage] Message inserted:", newMessage.id);

        // Construct message strictly matching the Message interface
        const messageWithSender = {
            id: newMessage.id,
            content: newMessage.content,
            senderId: newMessage.senderId,
            senderName: sender.name,
            senderImage: sender.image,
            createdAt: newMessage.createdAt, // Drizzle returns Date object
            reactions: []
        };

        console.log("[sendMessage] Updating conversation lastMessageAt...");
        // Ensure we only update existing columns. Checked schema: conversations has lastMessageId?
        // Actually, previous code only updated lastMessageAt. Let's stick to that unless we are sure.
        // Viewing schema.ts (Step 258 output will confirm, but let's be safe and assume lastMessageAt only for now,
        // or check if I saw lastMessageId in previous gets. 
        // usage in getConversations: `lastMessage: convo.messages[0]` implies it fetches via relation, not column.
        // However, if I want to update `updatedAt`, I should do that.
        await db.update(conversations)
            .set({
                lastMessageAt: new Date(),
                // updatedAt: new Date() // If exists
            })
            .where(eq(conversations.id, conversationId));

        console.log("[sendMessage] Triggering Pusher event...");
        try {
            await pusherServer.trigger(
                `conversation-${conversationId}`,
                "new-message",
                {
                    ...messageWithSender,
                    createdAt: newMessage.createdAt.toISOString() // Serialize date for Pusher
                }
            );
            console.log("[sendMessage] Pusher triggered successfully");
        } catch (pusherError: any) {
            console.error("[sendMessage] Pusher Trigger Failed:", pusherError);
        }

        // Return full message structure for UI to use immediately
        return {
            success: true,
            message: messageWithSender
        };
    } catch (error: any) {
        console.error("[sendMessage] Critical Error:", error);
        return { error: `Failed to send message: ${error.message}` };
    }
}

// --- TOGGLE REACTION ---
// Kept for compatibility but UI connection removed. Can be cleaned up later.
export async function toggleReaction(messageId: string, emoji: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    const userId = session.user.id;

    // 1. Check if reaction exists
    const existing = await db.query.messageReactions.findFirst({
        where: and(
            eq(messageReactions.messageId, messageId),
            eq(messageReactions.userId, userId),
            eq(messageReactions.emoji, emoji)
        )
    });

    // 2. Toggle logic
    try {
        if (existing) {
            await db.delete(messageReactions).where(
                and(
                    eq(messageReactions.messageId, messageId),
                    eq(messageReactions.userId, userId),
                    eq(messageReactions.emoji, emoji)
                )
            );
        } else {
            await db.insert(messageReactions).values({
                messageId,
                userId,
                emoji
            });
        }

        // 3. Fetch updated reactions for this message to broadcast
        const updatedReactions = await db.query.messageReactions.findMany({
            where: eq(messageReactions.messageId, messageId),
            with: { user: { columns: { id: true, name: true } } }
        });

        // Get conversation ID for Pusher channel
        const msg = await db.query.messages.findFirst({
            where: eq(messages.id, messageId),
            columns: { conversationId: true }
        });

        if (msg) {
            // 4. Trigger Pusher Event
            await pusherServer.trigger(
                `conversation-${msg.conversationId}`,
                "message-reaction-update",
                {
                    messageId,
                    reactions: updatedReactions
                }
            );
        }

        return { success: true };
    } catch (e) {
        console.error("Toggle Reaction Error:", e);
        return { error: "Failed to toggle reaction" };
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
                            user: { columns: { id: true, name: true, image: true, lastSeen: true } }
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
            otherUserLastSeen: otherUser?.lastSeen,
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

    const allMessages = await db.query.messages.findMany({
        where: eq(messages.conversationId, conversationId),
        orderBy: [desc(messages.createdAt)],
        limit: 50,
        with: {
            sender: { columns: { id: true, name: true, image: true } },
            reactions: {
                with: {
                    user: { columns: { id: true, name: true } } // Fetch who reacted
                }
            }
        }
    });

    return allMessages.map(msg => ({
        ...msg,
        senderName: msg.sender.name,
        senderImage: msg.sender.image,
        reactions: msg.reactions || [],
    }));
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
