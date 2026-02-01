"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { friendRequests, friends, users, notifications } from "@/db/schema";
import { eq, and, or, not, ilike } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// 1. Send Friend Request
export async function sendFriendRequest(targetUserId: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };
    const currentUserId = session.user.id;

    if (currentUserId === targetUserId) return { error: "Nie możesz dodać samego siebie." };

    // A. Check if already friends
    const existingFriend = await db.query.friends.findFirst({
        where: and(
            eq(friends.userId, currentUserId),
            eq(friends.friendId, targetUserId)
        )
    });
    if (existingFriend) return { error: "Jesteście już znajomymi." };

    // B. Check if request already exists (in either direction)
    const existingRequest = await db.query.friendRequests.findFirst({
        where: or(
            and(eq(friendRequests.senderId, currentUserId), eq(friendRequests.receiverId, targetUserId)),
            and(eq(friendRequests.senderId, targetUserId), eq(friendRequests.receiverId, currentUserId))
        )
    });

    if (existingRequest) return { error: "Zaproszenie już istnieje." };

    // C. Create Request & Notification
    await db.transaction(async (tx) => {
        await tx.insert(friendRequests).values({
            senderId: currentUserId,
            receiverId: targetUserId
        });

        await tx.insert(notifications).values({
            recipientId: targetUserId,
            senderId: currentUserId,
            type: "FRIEND_REQUEST",
            content: "Wysłał Ci zaproszenie do znajomych.",
            resourceId: "/dashboard/friends", // Redirect to friends page
            isRead: false
        });
    });

    revalidatePath("/dashboard/friends");
    return { success: "Zaproszenie wysłane." };
}

// 2. Accept Friend Request
export async function acceptFriendRequest(senderId: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };
    const currentUserId = session.user.id;

    // Verify request exists
    const request = await db.query.friendRequests.findFirst({
        where: and(
            eq(friendRequests.senderId, senderId),
            eq(friendRequests.receiverId, currentUserId)
        )
    });

    if (!request) return { error: "Zaproszenie nie istnieje." };

    await db.transaction(async (tx) => {
        // A. Delete Request
        await tx.delete(friendRequests).where(
            and(
                eq(friendRequests.senderId, senderId),
                eq(friendRequests.receiverId, currentUserId)
            )
        );

        // B. Insert Friend Records (Bidirectional)
        await tx.insert(friends).values([
            { userId: currentUserId, friendId: senderId },
            { userId: senderId, friendId: currentUserId }
        ]);

        // C. Notify Sender
        await tx.insert(notifications).values({
            recipientId: senderId,
            senderId: currentUserId,
            type: "FRIEND_ACCEPT",
            content: "Zaakceptował Twoje zaproszenie.",
            resourceId: `/dashboard/chat/start/${currentUserId}`, // Optional: deep link to start chat
            isRead: false
        });
    });

    revalidatePath("/dashboard/friends");
    revalidatePath("/dashboard/chat"); // Refresh chat contacts potentially
    return { success: "Zaproszenie zaakceptowane." };
}

// 3. Reject / Cancel Request
export async function removeFriendRequest(targetId: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };
    const currentUserId = session.user.id;

    // Delete request where I am sender OR receiver (handles cancel and reject)
    await db.delete(friendRequests).where(
        or(
            and(eq(friendRequests.senderId, currentUserId), eq(friendRequests.receiverId, targetId)),
            and(eq(friendRequests.senderId, targetId), eq(friendRequests.receiverId, currentUserId))
        )
    );

    revalidatePath("/dashboard/friends");
    return { success: "Usunięto zaproszenie." };
}

// 4. Remove Friend
export async function removeFriend(friendId: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };
    const currentUserId = session.user.id;

    await db.transaction(async (tx) => {
        // Delete BOTH records
        await tx.delete(friends).where(
            or(
                and(eq(friends.userId, currentUserId), eq(friends.friendId, friendId)),
                and(eq(friends.userId, friendId), eq(friends.friendId, currentUserId))
            )
        );
    });

    revalidatePath("/dashboard/friends");
    revalidatePath("/dashboard/chat");
    return { success: "Usunięto ze znajomych." };
}

// 5. Getters
export async function getFriends() {
    const session = await auth();
    if (!session?.user?.id) return [];

    const data = await db.query.friends.findMany({
        where: eq(friends.userId, session.user.id),
        with: {
            friend: {
                columns: { id: true, name: true, image: true, email: true }
            }
        }
    });

    return data.map(f => f.friend);
}

export async function getFriendRequests() {
    const session = await auth();
    if (!session?.user?.id) return { sent: [], received: [] };

    const received = await db.query.friendRequests.findMany({
        where: eq(friendRequests.receiverId, session.user.id),
        with: {
            sender: { columns: { id: true, name: true, image: true } }
        }
    });

    const sent = await db.query.friendRequests.findMany({
        where: eq(friendRequests.senderId, session.user.id),
        with: {
            receiver: { columns: { id: true, name: true, image: true } }
        }
    });

    return { received, sent };
}

export async function searchUsers(query: string) {
    const session = await auth();
    if (!session?.user?.id) return [];

    if (!query || query.length < 3) return [];

    const foundUsers = await db.query.users.findMany({
        where: or(
            ilike(users.name, `%${query}%`),
            ilike(users.email, `%${query}%`)
        ),
        limit: 5,
        columns: { id: true, name: true, image: true, email: true }
    });

    // Filtrujemy samego siebie
    return foundUsers.filter(u => u.id !== session.user.id);
}
