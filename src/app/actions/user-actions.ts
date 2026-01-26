"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

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
