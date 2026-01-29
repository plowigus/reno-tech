"use server";

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import { verifyTurnstile } from "@/lib/turnstile";

export interface AuthState {
    error?: string;
    success?: string;
}

export async function loginUser(prevState: AuthState, formData: FormData): Promise<AuthState> {
    // 1. Sprawdzenie Honeypot
    const honeypot = formData.get("_gotcha");
    if (honeypot && honeypot.toString().length > 0) {
        return { error: "Bot detected." };
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
            redirectTo: "/dashboard",
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
        throw error;
    }
    return { success: "Zalogowano!" };
}

export async function loginWithGoogle() {
    await signIn("google", { redirectTo: "/dashboard" });
}

export async function handleSignOut() {
    await signOut({ redirectTo: "/" });
}