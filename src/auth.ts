import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";
import { users } from "@/db/schema"; // potrzebne do szukania usera
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: DrizzleAdapter(db),
    providers: [
        Google,
        Credentials({
            credentials: {
                email: {},
                password: {},
            },
            authorize: async (credentials) => {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const email = credentials.email as string;
                const password = credentials.password as string;

                // 1. Pobierz usera z bazy
                const user = await db.query.users.findFirst({
                    where: eq(users.email, email)
                });

                // 2. Jeśli nie ma usera lub nie ma hasła (bo np. logował się Googlem)
                if (!user || !user.password) {
                    throw new Error("Nie znaleziono użytkownika lub złe hasło");
                }

                // 3. Sprawdź hasło (porównaj zaszyfrowane)
                const passwordsMatch = await bcrypt.compare(password, user.password);

                if (!passwordsMatch) {
                    throw new Error("Nieprawidłowe hasło");
                }

                // 4. Zwróć usera (sukces)
                return user;
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login", // nasza własna strona logowania
    },
    callbacks: {
        session({ session, token }) {
            if (token.sub && session.user) {
                session.user.id = token.sub;
            }
            return session;
        },
    },
});