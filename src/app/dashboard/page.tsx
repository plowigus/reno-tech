import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import Image from "next/image";

export default async function DashboardPage() {
    // 1. Pobierz sesję z serwera
    const session = await auth();

    // 2. Jeśli nie ma sesji (ktoś wszedł z palca w link), wyrzuć go do logowania
    if (!session?.user) {
        redirect("/api/auth/signin");
    }

    return (
        <main className="min-h-screen bg-black text-white pt-32 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800">

                    {/* Nagłówek */}
                    <div className="flex items-center gap-6 mb-8">
                        {session.user.image && (
                            <Image
                                src={session.user.image}
                                alt="Avatar"
                                width={80}
                                height={80}
                                className="rounded-full border-2 border-red-600"
                            />
                        )}
                        <div>
                            <h1 className="text-3xl font-bold">Witaj, {session.user.name}!</h1>
                            <p className="text-gray-400">{session.user.email}</p>
                            <p className="text-xs text-zinc-600 mt-1">ID: {session.user.id}</p>
                        </div>
                    </div>

                    {/* Sekcja przycisków */}
                    <div className="flex gap-4">
                        {/* Przycisk Wylogowania (Server Action) */}
                        <form
                            action={async () => {
                                "use server";
                                await signOut({ redirectTo: "/" });
                            }}
                        >
                            <button
                                type="submit"
                                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                            >
                                Wyloguj się
                            </button>
                        </form>
                    </div>

                </div>

                {/* Tu w przyszłości będzie historia zamówień */}
                <div className="mt-8 grid gap-4 text-zinc-500">
                    <p>Tu wkrótce pojawi się historia Twoich zamówień...</p>
                </div>
            </div>
        </main>
    );
}