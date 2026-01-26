"use client";

import { useActionState, useState } from "react";
import { loginUser, loginWithGoogle, AuthState } from "@/app/actions/auth-actions"; //
import { registerUser } from "@/app/actions/register"; //
import { Loader2, Mail, Lock, User, Eye, EyeOff, Chrome, AlertCircle, CheckCircle2 } from "lucide-react";
import { InteractiveLogo } from "@/components/Animation/InteractiveLogo";

// 1. Definiujemy propsy
interface AuthFormProps {
    initialTab?: "login" | "register";
}

const initialState: AuthState = {
    error: "",
    success: "",
};

// 2. Odbieramy initialTab i ustawiamy jako domyślny stan
export default function AuthForm({ initialTab = "login" }: AuthFormProps) {
    const [mode, setMode] = useState<"login" | "register">(initialTab);

    const [loginState, loginAction, isLoginPending] = useActionState(loginUser, initialState);
    const [registerState, registerAction, isRegisterPending] = useActionState(registerUser, initialState);

    const [showPassword, setShowPassword] = useState(false);
    const [passwordError, setPasswordError] = useState("");

    const isLogin = mode === "login";

    const toggleMode = () => {
        setMode(isLogin ? "register" : "login");
        setPasswordError("");
    };

    return (
        <div className="w-full max-w-md p-6">
            {/* Logo Section */}
            <div className="flex justify-center mb-8">
                <div className="scale-75 origin-center">
                    <InteractiveLogo />
                </div>
            </div>

            {/* Header Text - AuthForm sam dba o nagłówki */}
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-white mb-2">
                    {isLogin ? "Witaj z powrotem" : "Stwórz konto"}
                </h1>
                <p className="text-zinc-400">
                    {isLogin ? "Zaloguj się, aby zarządzać zamówieniami" : "Dołącz do Reno Tech w kilka sekund"}
                </p>
            </div>

            <form
                action={isLogin ? loginAction : registerAction}
                onSubmit={(e) => {
                    if (!isLogin) {
                        const formData = new FormData(e.currentTarget);
                        if (formData.get("password") !== formData.get("confirmPassword")) {
                            e.preventDefault();
                            setPasswordError("Hasła nie są identyczne");
                        } else {
                            setPasswordError("");
                        }
                    }
                }}
                className="space-y-5"
            >
                {!isLogin && (
                    <div className="space-y-2">
                        <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider">Imię</label>
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-red-500 transition-colors" />
                            <input
                                name="name"
                                type="text"
                                placeholder="Jan Kowalski"
                                required
                                className="w-full bg-zinc-900/80 border border-zinc-800 text-white rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all placeholder:text-zinc-600"
                            />
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                    <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider">Email</label>
                    <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-red-500 transition-colors" />
                        <input
                            name="email"
                            type="email"
                            placeholder="twoj@email.com"
                            required
                            className="w-full bg-zinc-900/80 border border-zinc-800 text-white rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all placeholder:text-zinc-600"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider">Hasło</label>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-red-500 transition-colors" />
                        <input
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            required
                            className="w-full bg-zinc-900/80 border border-zinc-800 text-white rounded-xl py-3.5 pl-12 pr-12 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all placeholder:text-zinc-600"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {!isLogin && (
                    <div className="space-y-2">
                        <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider">Powtórz hasło</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-red-500 transition-colors" />
                            <input
                                name="confirmPassword"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                required
                                className="w-full bg-zinc-900/80 border border-zinc-800 text-white rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all placeholder:text-zinc-600"
                            />
                        </div>
                    </div>
                )}

                {!isLogin && (
                    <div className="w-full h-12 bg-zinc-900/50 rounded flex items-center justify-center text-xs text-zinc-600 border border-dashed border-zinc-800">
                        Cloudflare Turnstile Widget
                    </div>
                )}

                {isLogin && (
                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center cursor-pointer group">
                            <input
                                type="checkbox"
                                className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-red-600 focus:ring-red-600 focus:ring-offset-0 cursor-pointer"
                            />
                            <span className="ml-2 text-zinc-400 group-hover:text-zinc-300 transition-colors">Zapamiętaj mnie</span>
                        </label>
                        <a href="#" className="text-zinc-400 hover:text-red-500 transition-colors">
                            Zapomniałeś hasła?
                        </a>
                    </div>
                )}

                {(passwordError || loginState?.error || registerState?.error) && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm animate-in fade-in slide-in-from-top-1">
                        <AlertCircle size={16} />
                        <p>{passwordError || loginState?.error || registerState?.error}</p>
                    </div>
                )}

                {(loginState?.success || registerState?.success) && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 text-sm animate-in fade-in slide-in-from-top-1">
                        <CheckCircle2 size={16} />
                        <p>{loginState?.success || registerState?.success}</p>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLogin ? isLoginPending : isRegisterPending}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl py-4 transition-all duration-200 shadow-lg shadow-red-600/20 hover:shadow-red-600/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isLogin
                        ? (isLoginPending ? <Loader2 className="animate-spin" /> : "Zaloguj się")
                        : (isRegisterPending ? <Loader2 className="animate-spin" /> : "Zarejestruj się")
                    }
                </button>
            </form>

            <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-zinc-800"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-wider">
                    <span className="px-4 bg-black text-zinc-500">lub kontynuuj z</span>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                <button
                    type="button"
                    onClick={() => loginWithGoogle()}
                    className="flex items-center justify-center gap-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white rounded-xl py-3 transition-all group"
                >
                    <Chrome className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" />
                    <span>Google</span>
                </button>
            </div>

            <p className="mt-8 text-center text-zinc-400">
                {isLogin ? "Nie masz konta?" : "Masz już konto?"}{" "}
                <button
                    onClick={toggleMode}
                    className="text-red-600 hover:text-red-500 font-semibold transition-colors hover:underline decoration-red-600/30 underline-offset-4"
                >
                    {isLogin ? "Zarejestruj się" : "Zaloguj się"}
                </button>
            </p>
        </div>
    );
}