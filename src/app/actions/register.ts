"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";

const RegisterSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6, "Hasło musi mieć min. 6 znaków"),
    name: z.string().min(2, "Imię jest wymagane"),
});

export async function registerUser(formData: FormData) {
    // 1. Walidacja danych
    const rawData = Object.fromEntries(formData.entries());
    const validated = RegisterSchema.safeParse(rawData);

    if (!validated.success) {
        return { error: "Błędne dane formularza." };
    }

    const { email, password, name } = validated.data;

    // 2. Sprawdź czy użytkownik już istnieje
    const existingUser = await db.query.users.findFirst({
        where: eq(users.email, email),
    });

    if (existingUser) {
        return { error: "Taki użytkownik już istnieje!" };
    }

    // 3. Zaszyfruj hasło
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Zapisz w bazie
    await db.insert(users).values({
        email,
        name,
        password: hashedPassword,
    });

    return { success: "Konto utworzone! Możesz się zalogować." };
}