"use server";

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import { verifyTurnstile } from "@/lib/turnstile";

// 1. Definiujemy i eksportujemy typ TUTAJ (to jest bezpieczne miejsce)
export interface AuthState {
    error?: string;
    success?: string;
}

// 2. Logika logowania hasłem
export async function loginUser(prevState: AuthState, formData: FormData): Promise<AuthState> {
    const honeypot = formData.get("_gotcha");
    if (honeypot && honeypot.toString().length > 0) {
        return { error: "Bot detected via honeypot." };
    }

    const turnstileToken = formData.get("turnstileToken") as string;
    const isHuman = await verifyTurnstile(turnstileToken);

    if (!isHuman) {
        return { error: "Weryfikacja anty-botowa nie powiodła się." };
    }

    try {
        await signIn("credentials", {
            email: formData.get("email"),
            password: formData.get("password"),
            redirectTo: "/dashboard", // Przekierowanie po sukcesie
        });
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return { error: "Błędny email lub hasło." };
                default:
                    return { error: "Coś poszło nie tak." };
            }
        }
        // W Next.js redirect jest rzucany jako błąd, więc musimy go przepuścić
        throw error;
    }
    return { success: "Zalogowano!" };
}

// 3. Logika logowania Google
export async function loginWithGoogle() {
    await signIn("google", { redirectTo: "/dashboard" });
}

// 4. BRAKUJĄCA FUNKCJA: Wylogowanie
export async function handleSignOut() {
    await signOut({ redirectTo: "/" });
}