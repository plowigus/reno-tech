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
                <div className={`relative w-8 h-8 rounded-full overflow-hidden border border-white/20 ${user.role === "admin" ? "ring-2 ring-yellow-500 ring-offset-2 ring-offset-black" : ""}`}>
                    {user.image ? (
                        <Image
                            src={user.image}
                            alt={user.name || "Avatar użytkownika"}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-white">
                            <span className="text-sm font-bold">
                                {user.name?.charAt(0) || "U"}
                            </span>
                        </div>
                    )}

                    {user.role === "admin" && (
                        <div className="absolute -bottom-1 z-20 -right-1 bg-yellow-500 text-black rounded-full p-[2px] border-2 border-zinc-900 flex items-center justify-center ">
                            <Crown size={10} strokeWidth={3} />
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
