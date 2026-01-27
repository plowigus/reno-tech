"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { User } from "next-auth";
import { handleSignOut } from "@/app/actions/auth-actions";
import { LogOut, User as UserIcon, Crown } from "lucide-react";

interface UserWithRole extends User {
    role?: string;
}

interface UserNavProps {
    user: UserWithRole | null | undefined;
}

export default function UserNav({ user }: UserNavProps) {
    const [isOpen, setIsOpen] = useState(false);

    if (!user) {
        return (
            <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-white tracking-wide border border-red-600 rounded-md hover:bg-red-600/10 transition-colors duration-200"
            >
                Zaloguj
            </Link>
        );
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 focus:outline-none"
            >
                <div className="relative">
                    <div className="w-9 h-9 rounded-full overflow-hidden border border-zinc-700 bg-zinc-800">
                        {user.image ? (
                            <Image
                                src={user.image}
                                alt={user.name || "Avatar użytkownika"}
                                fill
                                className="object-cover rounded-full"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-500">
                                <span className="text-sm font-bold">
                                    {user.name?.charAt(0) || "U"}
                                </span>
                            </div>
                        )}
                    </div>

                    {user.role === "admin" && (
                        <div className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 bg-zinc-900 text-yellow-500 rounded-full p-0.5 border border-zinc-800 shadow-sm z-10">
                            <Crown size={10} className="fill-yellow-500/10" strokeWidth={2.5} />
                        </div>
                    )}
                </div>
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-zinc-900 border border-white/10 ring-1 ring-black ring-opacity-5 z-50 overflow-hidden">
                        <div className="py-2 px-4 border-b border-white/5">
                            <p className="text-sm font-medium text-white">
                                {user.name || "Użytkownik"}
                            </p>
                            <p className="text-xs text-zinc-400 truncate">
                                {user.email || ""}
                            </p>
                        </div>
                        <div className="py-1">
                            <Link
                                href="/dashboard"
                                className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                <UserIcon size={16} />
                                Panel użytkownika
                            </Link>
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    handleSignOut();
                                }}
                                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors text-left"
                            >
                                <LogOut size={16} />
                                Wyloguj się
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
