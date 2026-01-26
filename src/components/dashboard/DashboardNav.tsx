"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Package, Settings, LogOut } from "lucide-react";
import { handleSignOut } from "@/app/actions/auth-actions";
import { cn } from "@/lib/utils";

const navItems = [
    {
        name: "Mój Profil",
        href: "/dashboard",
        icon: User,
    },
    {
        name: "Zamówienia",
        href: "/dashboard/orders",
        icon: Package,
    },
    {
        name: "Ustawienia",
        href: "/dashboard/settings",
        icon: Settings,
    },
];

export function DashboardNav() {
    const pathname = usePathname();

    return (
        <nav className="w-full lg:w-64 flex flex-col space-y-2">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4">
                <div className="space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-red-600/10 text-red-600"
                                        : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                                )}
                            >
                                <item.icon size={20} />
                                {item.name}
                            </Link>
                        );
                    })}
                </div>

                <div className="my-4 border-t border-zinc-800/50"></div>

                <form action={handleSignOut}>
                    <button
                        type="submit"
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-all duration-200"
                    >
                        <LogOut size={20} />
                        Wyloguj
                    </button>
                </form>
            </div>
        </nav>
    );
}
