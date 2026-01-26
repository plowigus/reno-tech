"use client";

import { useActionState, useState } from "react";
import { updateUserProfile, ProfileState } from "@/app/actions/user-actions";
import { UploadButton } from "@/lib/uploadthing";
import Image from "next/image";
import { Loader2, User, Phone, MapPin, Building, Globe, CheckCircle2, AlertCircle } from "lucide-react";

interface SettingsFormProps {
    user: any; // Using any for simplicity with Drizzle type inference usually needed
}

const initialState: ProfileState = {
    error: "",
    success: "",
};

export default function SettingsForm({ user }: SettingsFormProps) {
    const [state, action, isPending] = useActionState(updateUserProfile, initialState);
    const [imagePreview, setImagePreview] = useState(user.image || "");

    return (
        <form action={action} className="space-y-8">
            {/* Sekcja Avatara */}
            <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800/50">
                <h2 className="text-xl font-semibold mb-6">Zdjęcie profilowe</h2>
                <div className="flex items-center gap-8">
                    <div className="relative group">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-zinc-700 bg-zinc-800 relative">
                            {imagePreview ? (
                                <Image
                                    src={imagePreview}
                                    alt="Avatar"
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-500">
                                    <User size={32} />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <UploadButton
                            endpoint="profileImage"
                            appearance={{
                                button: "bg-zinc-800 text-white hover:bg-zinc-700 text-sm py-2 px-4 rounded-lg transition-colors border border-zinc-700",
                                allowedContent: "hidden"
                            }}
                            content={{
                                button: "Zmień zdjęcie"
                            }}
                            onClientUploadComplete={(res) => {
                                if (res && res[0]) {
                                    setImagePreview(res[0].url);
                                }
                            }}
                            onUploadError={(error: Error) => {
                                alert(`ERROR! ${error.message}`);
                            }}
                        />
                        <p className="text-xs text-zinc-500">
                            JPG, PNG lub GIF. Max 4MB.
                        </p>
                    </div>
                </div>
                {/* Hidden input to send image URL */}
                <input type="hidden" name="image" value={imagePreview} />
            </div>

            {/* Dane osobowe */}
            <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800/50">
                <h2 className="text-xl font-semibold mb-6">Dane osobowe</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400">Imię i nazwisko</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                            <input
                                name="name"
                                defaultValue={user.name || ""}
                                type="text"
                                placeholder="Jan Kowalski"
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all placeholder:text-zinc-600"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400">Numer telefonu</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                            <input
                                name="phoneNumber"
                                defaultValue={user.phoneNumber || ""}
                                type="tel"
                                placeholder="+48 123 456 789"
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all placeholder:text-zinc-600"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Adres */}
            <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800/50">
                <h2 className="text-xl font-semibold mb-6">Adres dostawy</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-sm font-medium text-zinc-400">Ulica i numer</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                            <input
                                name="street"
                                defaultValue={user.street || ""}
                                type="text"
                                placeholder="ul. Przykładowa 1/2"
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all placeholder:text-zinc-600"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400">Kod pocztowy</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                            <input
                                name="postalCode"
                                defaultValue={user.postalCode || ""}
                                type="text"
                                placeholder="00-000"
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all placeholder:text-zinc-600"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400">Miasto</label>
                        <div className="relative">
                            <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                            <input
                                name="city"
                                defaultValue={user.city || ""}
                                type="text"
                                placeholder="Warszawa"
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all placeholder:text-zinc-600"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400">Kraj</label>
                        <div className="relative">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                            <input
                                name="country"
                                defaultValue={user.country || "Poland"}
                                type="text"
                                placeholder="Polska"
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all placeholder:text-zinc-600"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Messages */}
            {state?.error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm animate-in fade-in slide-in-from-top-1">
                    <AlertCircle size={16} />
                    <p>{state.error}</p>
                </div>
            )}

            {state?.success && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 text-sm animate-in fade-in slide-in-from-top-1">
                    <CheckCircle2 size={16} />
                    <p>{state.success}</p>
                </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isPending}
                    className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-red-600/20 hover:shadow-red-600/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {isPending ? <Loader2 className="animate-spin" /> : "Zapisz zmiany"}
                </button>
            </div>
        </form>
    );
}
