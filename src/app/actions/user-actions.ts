"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { UserFormValues } from "@/lib/validators/user-schema";

// --- TYPES ---
export type ProfileState = {
    error?: string;
    success?: string;
};

// --- UPDATE LAST SEEN (NEW) ---
export async function updateLastSeen() {
    const session = await auth();
    if (!session?.user?.id) return;

    try {
        await db.update(users)
            .set({ lastSeen: new Date() })
            .where(eq(users.id, session.user.id));
    } catch (e) {
        // Ignore errors for background update
    }
}

// --- GET USER BY ID (RESTORED) ---
export async function getUserById(userId: string) {
    const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
    });
    return user;
}

// --- DELETE USER (RESTORED) ---
export async function deleteUser(userId: string) {
    const session = await auth();
    // Validate functionality access (e.g. admin only)
    if (session?.user?.role !== "admin") {
        return { error: "Brak uprawnień" };
    }

    try {
        await db.delete(users).where(eq(users.id, userId));
        revalidatePath("/dashboard/admin/users");
        return { success: true };
    } catch (e) {
        return { error: "Błąd usuwania użytkownika" };
    }
}

// --- UPDATE USER (For Admin Panel) (RESTORED) ---
export async function updateUser(userId: string, data: Partial<UserFormValues>) {
    const session = await auth();

    const isAdmin = session?.user?.role === "admin";
    const isSelf = session?.user?.id === userId;

    if (!isAdmin && !isSelf) {
        return { error: "Brak uprawnień" };
    }

    try {
        await db.update(users)
            .set({
                name: data.name,
                email: data.email,
                role: data.role,
            })
            .where(eq(users.id, userId));

        revalidatePath("/dashboard/admin/users");
        revalidatePath("/dashboard/settings");
        return { success: true };
    } catch (e) {
        return { error: "Błąd aktualizacji użytkownika" };
    }
}

// --- UPDATE USER PROFILE (For Settings Page) (RESTORED) ---
export async function updateUserProfile(prevState: ProfileState, formData: FormData): Promise<ProfileState> {
    const session = await auth();
    if (!session?.user?.id) return { error: "Musisz być zalogowany" };

    const name = formData.get("name") as string;
    const phoneNumber = formData.get("phoneNumber") as string;
    const street = formData.get("street") as string; // Assuming AddressAutocomplete sends this or handled via hidden input if verified
    const city = formData.get("city") as string;
    const postalCode = formData.get("postalCode") as string;
    const country = formData.get("country") as string;
    const image = formData.get("image") as string;

    try {
        await db.update(users)
            .set({
                name,
                phoneNumber,
                street, // If null/empty, might overwrite? Assuming form handles defaults
                city,
                postalCode,
                country,
                image,
            })
            .where(eq(users.id, session.user.id));

        revalidatePath("/dashboard/settings");
        return { success: "Zaktualizowano profil" };
    } catch (error) {
        console.error("Update Profile Error:", error);
        return { error: "Wystąpił błąd podczas aktualizacji profilu." };
    }
}
