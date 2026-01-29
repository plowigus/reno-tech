"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { verifyTurnstile } from "@/lib/turnstile";
import { signIn } from "@/auth"; // IMPORT SIGNIN
import { AuthError } from "next-auth";

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
  // 1. Sprawdzenie Honeypot
  const honeypot = formData.get("_gotcha");
  if (honeypot && honeypot.toString().length > 0) {
    return { error: "Bot detected via honeypot." }; // Cichy błąd lub standardowy
  }

  // 2. Turnstile
  const turnstileToken = formData.get("turnstileToken") as string;
  const isHuman = await verifyTurnstile(turnstileToken);

  if (!isHuman) {
    return { error: "Weryfikacja anty-botowa nie powiodła się. Spróbuj ponownie." };
  }

  // 3. Walidacja danych
  const rawData = Object.fromEntries(formData.entries());
  const validated = RegisterSchema.safeParse(rawData);

  if (!validated.success) {
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
      role: "user",
    });

    // AUTO-LOGIN PO REJESTRACJI
    try {
      await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      return { success: "Konto utworzone! Następuje logowanie..." };
    } catch (authErr) {
      if (authErr instanceof AuthError) {
        return { error: "Konto utworzone, ale błąd automatycznego logowania." };
      }
      throw authErr;
    }

  } catch (err) {
    console.error("Błąd rejestracji:", err);
    return { error: "Wystąpił błąd serwera podczas tworzenia konta." };
  }
}
