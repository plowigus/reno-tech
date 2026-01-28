"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userSchema, UserFormValues } from "@/lib/validators/user-schema";
import { updateUser } from "@/app/actions/user-actions";
import { useRouter } from "next/navigation";
import { Loader2, Save, User, Mail, Shield } from "lucide-react";
import { users } from "@/db/schema";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type UserFormProps = {
    initialData: typeof users.$inferSelect;
};

export function UserForm({ initialData }: UserFormProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const [error, setError] = useState<string | undefined>("");

    const form = useForm<UserFormValues>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            name: initialData.name || "",
            email: initialData.email || "",
            role: (initialData.role as "user" | "admin") || "user",
        },
    });

    function onSubmit(data: UserFormValues) {
        setError("");
        startTransition(async () => {
            const result = await updateUser(initialData.id, data);

            if (result.success) {
                toast.success("Zaktualizowano użytkownika");
                router.push("/dashboard/admin/users");
                router.refresh();
            } else {
                toast.error(result.error);
                setError(result.error);
            }
        });
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-foreground mb-2">
                    Edytuj użytkownika
                </h1>
                <p className="text-zinc-400">
                    Zarządzaj danymi i uprawnieniami użytkownika.
                </p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="bg-secondary/50 border border-border rounded-2xl p-6 space-y-6">
                    {/* Name */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                            <User size={16} /> Imię i nazwisko
                        </label>
                        <Input
                            {...form.register("name")}
                            className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus:border-red-600 focus:ring-red-600"
                            placeholder="Imię i nazwisko"
                        />
                        {form.formState.errors.name && (
                            <p className="text-sm text-red-500">
                                {form.formState.errors.name.message}
                            </p>
                        )}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                            <Mail size={16} /> Adres Email
                        </label>
                        <Input
                            {...form.register("email")}
                            type="email"
                            className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus:border-red-600 focus:ring-red-600"
                            placeholder="email@example.com"
                        />
                        {form.formState.errors.email && (
                            <p className="text-sm text-red-500">
                                {form.formState.errors.email.message}
                            </p>
                        )}
                    </div>

                    {/* Role */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                            <Shield size={16} /> Rola użytkownika
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <label className={`
                                relative flex items-center justify-center gap-2 p-4 rounded-xl border cursor-pointer transition-all
                                ${form.watch("role") === "user"
                                    ? "bg-secondary border-red-600 text-foreground"
                                    : "bg-zinc-800/30 border-zinc-700 text-zinc-400 hover:bg-zinc-800/50"}
                            `}>
                                <input
                                    type="radio"
                                    value="user"
                                    className="sr-only"
                                    {...form.register("role")}
                                />
                                <span className="font-medium">Użytkownik</span>
                            </label>

                            <label className={`
                                relative flex items-center justify-center gap-2 p-4 rounded-xl border cursor-pointer transition-all
                                ${form.watch("role") === "admin"
                                    ? "bg-secondary border-red-600 text-foreground"
                                    : "bg-zinc-800/30 border-zinc-700 text-zinc-400 hover:bg-zinc-800/50"}
                            `}>
                                <input
                                    type="radio"
                                    value="admin"
                                    className="sr-only"
                                    {...form.register("role")}
                                />
                                <span className="font-medium">Administrator</span>
                            </label>
                        </div>
                        {form.formState.errors.role && (
                            <p className="text-sm text-red-500">
                                {form.formState.errors.role.message}
                            </p>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl text-sm">
                        {error}
                    </div>
                )}

                <div className="flex justify-end">
                    <Button
                        type="submit"
                        disabled={isPending}
                        className="bg-red-600 hover:bg-red-700 text-foreground font-medium px-8 py-3 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed h-auto"
                    >
                        {isPending ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : (
                            <Save size={20} />
                        )}
                        Zapisz zmiany
                    </Button>
                </div>
            </form>
        </div>
    );
}
