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
        <aside className="fixed left-0 top-0 h-screen w-64 bg-zinc-950 border-r border-zinc-900 hidden lg:flex flex-col z-40">
            {/* Header / Logo Area */}
            <div className="h-20 flex items-center px-6 border-b border-zinc-900">
                <span className="text-xl font-bold bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
                    RENO TECH
                </span>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 py-8 px-4 space-y-2">
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
                                    : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                            )}
                        >
                            <item.icon size={20} />
                            {item.name}
                        </Link>
                    );
                })}
            </div>

            {/* Footer / Sign Out */}
            <div className="p-4 border-t border-zinc-900">
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
        </aside>
    );
}
