"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";
// ZMIANA IMPORTU: Bierzemy typ z auth-actions
import { AuthState } from "@/app/actions/auth-actions";

const RegisterSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6, "Hasło musi mieć min. 6 znaków"),
    name: z.string().min(2, "Imię jest wymagane"),
});

export async function registerUser(prevState: AuthState, formData: FormData): Promise<AuthState> {
    // ... (reszta kodu bez zmian)
    const rawData = Object.fromEntries(formData.entries());
    const validated = RegisterSchema.safeParse(rawData);

    if (!validated.success) {
        return { error: "Błędne dane formularza." };
    }

    const { email, password, name } = validated.data;

    try {
        const existingUser = await db.query.users.findFirst({
            where: eq(users.email, email),
        });

        if (existingUser) {
            return { error: "Taki użytkownik już istnieje!" };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.insert(users).values({
            email,
            name,
            password: hashedPassword,
        });

        return { success: "Konto utworzone! Możesz się zalogować." };
    } catch (err) {
        console.error(err);
        return { error: "Wystąpił błąd serwera." };
    }
}