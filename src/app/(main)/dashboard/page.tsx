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
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Edytuj Profil</h1>
                    <p className="text-zinc-400 mt-1">Zarządzaj swoimi danymi osobowymi i adresem dostawy.</p>
                </div>
            </div>

            <SettingsForm user={userData} />
        </div>
    );
}