import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { redirect } from "next/navigation";
import { desc } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { DeleteUserButton } from "@/components/dashboard/users/DeleteUserButton";

export default async function UsersPage() {
    const session = await auth();

    if (session?.user?.role !== "admin") {
        redirect("/dashboard");
    }

    const allUsers = await db.query.users.findMany({
        orderBy: [desc(users.createdAt)],
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Użytkownicy</h1>
                    <p className="text-zinc-400 mt-1">
                        Lista wszystkich zarejestrowanych użytkowników
                    </p>
                </div>
            </div>

            <div className="border border-zinc-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-900/50 text-zinc-400 font-medium">
                            <tr>
                                <th className="px-6 py-4">Użytkownik</th>
                                <th className="px-6 py-4">Rola</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Dołączył</th>
                                <th className="px-6 py-4 text-right">Akcje</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {allUsers.map((user) => (
                                <tr
                                    key={user.id}
                                    className="hover:bg-zinc-900/30 transition-colors"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-zinc-800 shrink-0">
                                                {user.image ? (
                                                    <Image
                                                        src={user.image}
                                                        alt={user.name || "User"}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-zinc-500 font-medium">
                                                        {user.name?.[0]?.toUpperCase() || "?"}
                                                    </div>
                                                )}
                                            </div>
                                            <span className="font-medium text-white">
                                                {user.name || "Brak nazwy"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === "admin"
                                                ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                                                : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                                                }`}
                                        >
                                            {user.role === "admin" ? "Admin" : "User"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-zinc-400">
                                        {user.email}
                                    </td>
                                    <td className="px-6 py-4 text-zinc-500">
                                        {user.createdAt
                                            ? new Date(user.createdAt).toLocaleDateString("pl-PL", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })
                                            : "-"}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center gap-2 justify-end">
                                            <Link
                                                href={`/dashboard/admin/users/${user.id}/edit`}
                                                className="inline-flex items-center justify-center p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                                            >
                                                <Pencil size={18} />
                                            </Link>
                                            <DeleteUserButton id={user.id} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
