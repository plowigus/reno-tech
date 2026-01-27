"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { userSchema, UserFormValues } from "@/lib/validators/user-schema";

const profileSchema = z.object({
    name: z.string().min(2, "Imię musi mieć co najmniej 2 znaki"),
    phoneNumber: z.string().optional(),
    street: z.string().optional(),
    city: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
    image: z.string().url().optional().or(z.literal("")),
});

export type ProfileState = {
    error?: string;
    success?: string;
};

export async function updateUserProfile(prevState: ProfileState, formData: FormData): Promise<ProfileState> {
    const session = await auth();

    if (!session?.user?.id) {
        return { error: "Nie jesteś zalogowany" };
    }

    const rawData = {
        name: formData.get("name"),
        phoneNumber: formData.get("phoneNumber"),
        street: formData.get("street"),
        city: formData.get("city"),
        postalCode: formData.get("postalCode"),
        country: formData.get("country"),
        image: formData.get("image"),
    };

    const validatedFields = profileSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            error: validatedFields.error.issues[0].message,
        };
    }

    const { name, phoneNumber, street, city, postalCode, country, image } = validatedFields.data;

    try {
        await db
            .update(users)
            .set({
                name,
                phoneNumber: phoneNumber || null,
                street: street || null,
                city: city || null,
                postalCode: postalCode || null,
                country: country || null,
                // Only update image if it's a valid URL string (not empty)
                ...(image ? { image } : {}),
            })
            .where(eq(users.id, session.user.id));

        revalidatePath("/dashboard");
        revalidatePath("/", "layout");
        return { success: "Profil został zaktualizowany" };
    } catch (error) {
        console.error("Profile update error:", error);
        return { error: "Wystąpił błąd podczas aktualizacji profilu" };
    }
}



// --- Admin Actions ---

export async function getUserById(id: string) {
    try {
        const user = await db.query.users.findFirst({
            where: (users, { eq }) => eq(users.id, id),
        });

        return user || null;
    } catch (error) {
        console.error("Error fetching user:", error);
        return null;
    }
}

export async function updateUser(id: string, data: UserFormValues) {
    try {
        const validatedFields = userSchema.safeParse(data);

        if (!validatedFields.success) {
            return {
                success: false,
                error: "Błąd walidacji danych.",
            };
        }

        const { name, email, role } = validatedFields.data;

        await db
            .update(users)
            .set({
                name,
                email,
                role,
            })
            .where(eq(users.id, id));

        revalidatePath("/dashboard/admin/users");

        return { success: true };
    } catch (error: any) {
        console.error("Error updating user:", error);
        return {
            success: false,
            error: "Wystąpił błąd podczas aktualizacji użytkownika.",
        };
    }
}

export async function deleteUser(id: string) {
    try {
        await db.delete(users).where(eq(users.id, id));

        revalidatePath("/dashboard/admin/users");

        return { success: true };
    } catch (error) {
        console.error("Error deleting user:", error);
        return {
            success: false,
            error: "Wystąpił błąd podczas usuwania użytkownika.",
        };
    }
}
