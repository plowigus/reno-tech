"use server";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function updateLastSeen() {
    const session = await auth();
    if (!session?.user?.id) return;

    await db.update(users)
        .set({ lastSeen: new Date() })
        .where(eq(users.id, session.user.id));
}
