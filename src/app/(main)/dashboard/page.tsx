import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import SettingsForm from "@/components/dashboard/SettingsForm";

export default async function DashboardPage() {
    // 1. Pobierz sesję z serwera
    const session = await auth();

    // 2. Jeśli nie ma sesji (ktoś wszedł z palca w link), wyrzuć go do logowania
    if (!session?.user?.id) {
        redirect("/api/auth/signin");
    }

    // 3. Pobierz pełne dane użytkownika z bazy
    const userData = await db.query.users.findFirst({
        where: eq(users.id, session.user.id),
    });

    if (!userData) {
        // Fallback jeśli użytkownik jest w sesji ale nie ma go w bazie (rzadkie)
        return <div>Nie znaleziono użytkownika</div>;
    }

    return (
        <main className="min-h-screen bg-black text-white pt-32 px-4 pb-20">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold">Ustawienia konta</h1>

                    {/* Przycisk Wylogowania (Server Action) */}
                    <form
                        action={async () => {
                            "use server";
                            await signOut({ redirectTo: "/" });
                        }}
                    >
                        <button
                            type="submit"
                            className="bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-lg font-medium transition-colors border border-zinc-800"
                        >
                            Wyloguj się
                        </button>
                    </form>
                </div>

                <SettingsForm user={userData} />
            </div>
        </main>
    );
}