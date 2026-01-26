"use client";

import { useActionState, useState, useEffect } from "react";
import { loginUser, loginWithGoogle, AuthState } from "@/app/actions/auth-actions";
import { registerUser } from "@/app/actions/register";
import { Loader2, Mail, Lock, User, Chrome, CheckCircle2 } from "lucide-react";

interface AuthFormProps {
    initialTab?: "login" | "register";
}

const initialState: AuthState = {
    error: "",
    success: "",
};

export default function AuthForm({ initialTab = "login" }: AuthFormProps) {
    const [activeTab, setActiveTab] = useState<"login" | "register">(initialTab);
    const [loginState, loginAction, isLoginPending] = useActionState(loginUser, initialState);
    const [registerState, registerAction, isRegisterPending] = useActionState(registerUser, initialState);

    // Client validation state for register
    const [registerData, setRegisterData] = useState({
        password: "",
        confirmPassword: "",
        email: "",
        name: ""
    });

    const [passwordError, setPasswordError] = useState("");

    const handleRegisterSubmit = async (formData: FormData) => {
        if (formData.get("password") !== formData.get("confirmPassword")) {
            setPasswordError("Hasła nie są identyczne");
            return;
        }
        setPasswordError("");
        // We wrap the server action call or just allow the form default action if validated
        // But since useActionState controls the action prop, we can't easily intercept 'submit' event to prevent native action if using form action={registerAction}.
        // Actually, useActionState wraps the action. We can do client validation inside the action wrapper, OR preventDefault on onSubmit.
        // Let's use onSubmit.
    };

    return (
        <div className="w-full bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-zinc-800">
                <button
                    onClick={() => setActiveTab("login")}
                    className={`flex-1 py-4 text-sm font-medium transition-colors relative ${activeTab === "login"
                            ? "text-white"
                            : "text-zinc-500 hover:text-zinc-300"
                        }`}
                >
                    Zaloguj się
                    {activeTab === "login" && (
                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab("register")}
                    className={`flex-1 py-4 text-sm font-medium transition-colors relative ${activeTab === "register"
                            ? "text-white"
                            : "text-zinc-500 hover:text-zinc-300"
                        }`}
                >
                    Zarejestruj się
                    {activeTab === "register" && (
                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600" />
                    )}
                </button>
            </div>

            <div className="p-8">
                {activeTab === "login" ? (
                    /* LOGIN FORM */
                    <form action={loginAction} className="space-y-4">
                        <div className="space-y-2">
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                                <input
                                    name="email"
                                    type="email"
                                    placeholder="Adres email"
                                    required
                                    className="w-full bg-black/50 border border-zinc-800 rounded-lg py-3 pl-10 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                                <input
                                    name="password"
                                    type="password"
                                    placeholder="Hasło"
                                    required
                                    className="w-full bg-black/50 border border-zinc-800 rounded-lg py-3 pl-10 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all"
                                />
                            </div>
                        </div>

                        {loginState?.error && (
                            <p className="text-red-500 text-sm bg-red-900/10 p-2 rounded border border-red-900/50">{loginState.error}</p>
                        )}

                        {loginState?.success && (
                            <p className="text-green-500 text-sm bg-green-900/10 p-2 rounded border border-green-900/50">{loginState.success}</p>
                        )}

                        <button
                            type="submit"
                            disabled={isLoginPending}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoginPending ? <Loader2 className="animate-spin" size={20} /> : "Zaloguj się"}
                        </button>

                        <div className="relative py-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-zinc-800"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-zinc-900 px-2 text-zinc-500">Lub kontynuuj przez</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => loginWithGoogle()}
                            className="w-full bg-white text-black hover:bg-zinc-200 font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            <Chrome size={20} />
                            Google
                        </button>
                    </form>
                ) : (
                    /* REGISTER FORM */
                    <form action={registerAction} className="space-y-4" onSubmit={(e) => {
                        const formData = new FormData(e.currentTarget);
                        if (formData.get("password") !== formData.get("confirmPassword")) {
                            e.preventDefault();
                            setPasswordError("Hasła nie są identyczne");
                        } else {
                            setPasswordError("");
                        }
                    }}>
                        <div className="space-y-2">
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                                <input
                                    name="name"
                                    type="text"
                                    placeholder="Twoje imię"
                                    required
                                    className="w-full bg-black/50 border border-zinc-800 rounded-lg py-3 pl-10 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                                <input
                                    name="email"
                                    type="email"
                                    placeholder="Adres email"
                                    required
                                    className="w-full bg-black/50 border border-zinc-800 rounded-lg py-3 pl-10 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                                <input
                                    name="password"
                                    type="password"
                                    placeholder="Hasło"
                                    required
                                    className="w-full bg-black/50 border border-zinc-800 rounded-lg py-3 pl-10 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all"
                                />
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                                <input
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="Powtórz hasło"
                                    required
                                    className="w-full bg-black/50 border border-zinc-800 rounded-lg py-3 pl-10 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all"
                                />
                            </div>
                        </div>

                        {/* Cloudflare Turnstile Placeholder */}
                        <div className="w-full h-12 bg-zinc-800/50 rounded flex items-center justify-center text-xs text-zinc-500 border border-dashed border-zinc-700">
                            Cloudflare Turnstile Widget Placeholder
                        </div>

                        {passwordError && (
                            <p className="text-red-500 text-sm bg-red-900/10 p-2 rounded border border-red-900/50">{passwordError}</p>
                        )}

                        {registerState?.error && (
                            <p className="text-red-500 text-sm bg-red-900/10 p-2 rounded border border-red-900/50">{registerState.error}</p>
                        )}

                        {registerState?.success && (
                            <p className="text-green-500 text-sm bg-green-900/10 p-2 rounded border border-green-900/50">{registerState.success}</p>
                        )}

                        <button
                            type="submit"
                            disabled={isRegisterPending}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isRegisterPending ? <Loader2 className="animate-spin" size={20} /> : "Zarejestruj się"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
