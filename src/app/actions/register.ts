"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { verifyTurnstile } from "@/lib/turnstile";

import { AuthState } from "@/app/actions/auth-actions";

const RegisterSchema = z.object({
    email: z.string().email({ message: "Nieprawidłowy adres email" }),
    password: z.string()
        .min(8, "Hasło musi mieć min. 8 znaków")
        .regex(/[A-Z]/, "Hasło musi zawierać jedną dużą literę")
        .regex(/[0-9]/, "Hasło musi zawierać jedną cyfrę")
        .regex(/[^A-Za-z0-9]/, "Hasło musi zawierać jeden znak specjalny"),
    name: z.string().min(2, "Imię jest wymagane"),
});

export async function registerUser(prevState: AuthState, formData: FormData): Promise<AuthState> {
    const turnstileToken = formData.get("turnstileToken") as string;
    const isHuman = await verifyTurnstile(turnstileToken);

    if (!isHuman) {
        return { error: "Weryfikacja anty-botowa nie powiodła się." };
    }

    // 1. Walidacja danych
    const rawData = Object.fromEntries(formData.entries());
    const validated = RegisterSchema.safeParse(rawData);

    if (!validated.success) {
        // ZMIANA: Zamiast .errors używamy .issues
        const errorMessage = validated.error.issues[0]?.message ?? "Nieprawidłowe dane formularza";
        return { error: errorMessage };
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
            // Dodajemy domyślne wartości dla nowych pól, żeby baza nie krzyczała (opcjonalne, jeśli są nullable)
            role: "user",
        });

        return { success: "Konto utworzone! Możesz się zalogować." };
    } catch (err) {
        console.error("Błąd rejestracji:", err);
        return { error: "Wystąpił błąd serwera podczas tworzenia konta." };
    }
}