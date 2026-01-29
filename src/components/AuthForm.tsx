"use client";

import { useActionState, useState, useRef, useEffect } from "react";
import { loginUser, loginWithGoogle, AuthState } from "@/app/actions/auth-actions";
import { registerUser } from "@/app/actions/register";
import { Loader2, Mail, Lock, User, Eye, EyeOff, Chrome, AlertCircle, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { TurnstileWidget, TurnstileRef } from "@/components/ui/turnstile-widget"; // Importujemy nowy typ
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; // Zakładam, że masz ten komponent, jeśli nie - użyj zwykłego <label>

interface AuthFormProps {
  initialTab?: "login" | "register";
}

const initialState: AuthState = {
  error: "",
  success: "",
};

export default function AuthForm({ initialTab = "login" }: AuthFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">(initialTab);
  const [turnstileToken, setTurnstileToken] = useState<string>("");

  // Ref do resetowania widgetu
  const turnstileRef = useRef<TurnstileRef>(null);

  const [loginState, loginAction, isLoginPending] = useActionState(loginUser, initialState);
  const [registerState, registerAction, isRegisterPending] = useActionState(registerUser, initialState);

  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const isLogin = mode === "login";

  // Resetowanie Turnstile przy błędach
  useEffect(() => {
    if (loginState?.error || registerState?.error) {
      turnstileRef.current?.reset();
      setTurnstileToken(""); // Czyścimy token w stanie
    }
  }, [loginState, registerState]);

  const toggleMode = () => {
    const newMode = isLogin ? "register" : "login";
    setMode(newMode);
    setPasswordError("");
    turnstileRef.current?.reset(); // Reset przy zmianie trybu
    router.replace(`/${newMode}`, { scroll: false });
  };

  const currentError = isLogin
    ? loginState?.error
    : (passwordError || registerState?.error);

  const currentSuccess = isLogin
    ? loginState?.success
    : registerState?.success;

  return (
    <div className="w-full max-w-md p-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">
          {isLogin ? "Witaj z powrotem" : "Stwórz konto"}
        </h1>
        <p className="text-zinc-400 text-sm">
          {isLogin ? "Zaloguj się, aby kontynuować" : "Dołącz do Reno Tech w kilka sekund"}
        </p>
      </div>

      <form
        action={isLogin ? loginAction : registerAction}
        noValidate
        onSubmit={(e) => {
          if (!isLogin) {
            const formData = new FormData(e.currentTarget);
            if (formData.get("password") !== formData.get("confirmPassword")) {
              e.preventDefault();
              setPasswordError("Hasła nie są identyczne");
              turnstileRef.current?.reset(); // Reset przy błędzie walidacji klienta
            } else {
              setPasswordError("");
            }
          }
        }}
        className="space-y-4"
      >
        {/* HONEYPOT - Niewidoczne pole dla botów */}
        <input
          type="text"
          name="_gotcha"
          style={{ display: 'none' }}
          tabIndex={-1}
          autoComplete="off"
        />

        {!isLogin && (
          <div className="space-y-1.5">
            <Label className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">Imię</Label>
            <div className="relative group">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-red-500 transition-colors" />
              <Input
                name="name"
                type="text"
                placeholder="Jan Kowalski"
                required
                autoComplete="name" // Ułatwia autouzupełnianie
                className="bg-background/50 border-zinc-800 text-white pl-9 pr-3 focus:border-red-600 focus:ring-red-600"
              />
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <Label className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">Email</Label>
          <div className="relative group">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-red-500 transition-colors" />
            <Input
              name="email"
              type="email"
              placeholder="twoj@email.com"
              required
              autoComplete="username" // Kluczowe dla managerów haseł
              className="bg-zinc-950/50 border-zinc-800 text-white pl-9 pr-3 focus:border-red-600 focus:ring-red-600"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">Hasło</Label>
          <div className="relative group">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-red-500 transition-colors" />
            <Input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              required
              // Rozróżnienie autocomplete dla logowania i rejestracji
              autoComplete={isLogin ? "current-password" : "new-password"}
              className="bg-zinc-950/50 border-zinc-800 text-white pl-9 pr-9 focus:border-red-600 focus:ring-red-600"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {!isLogin && (
          <div className="space-y-1.5">
            <Label className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">Powtórz hasło</Label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-red-500 transition-colors" />
              <Input
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                required
                autoComplete="new-password"
                className="w-full bg-background/50 border border-zinc-800 text-white rounded-lg py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all placeholder:text-zinc-600"
              />
            </div>
          </div>
        )}

        <input type="hidden" name="turnstileToken" value={turnstileToken} />

        {/* Styled Container matching Input fields */}
        <div className="w-full min-h-[50px] bg-zinc-950/50 border border-zinc-800 rounded-md flex items-center justify-center p-1 overflow-hidden transition-colors hover:border-zinc-700">
          <TurnstileWidget
            ref={turnstileRef}
            onVerify={setTurnstileToken}
            className="w-full"
          />
        </div>

        {isLogin && (
          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                className="w-3.5 h-3.5 rounded border-zinc-700 bg-zinc-900 text-red-600 focus:ring-red-600 focus:ring-offset-0 cursor-pointer"
              />
              <span className="ml-2 text-zinc-400 group-hover:text-zinc-300 transition-colors">Zapamiętaj mnie</span>
            </label>
            <a href="#" className="text-zinc-400 hover:text-red-500 transition-colors">
              Zapomniałeś hasła?
            </a>
          </div>
        )}

        {currentError && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs animate-in fade-in slide-in-from-top-1">
            <AlertCircle size={14} />
            <p>{currentError}</p>
          </div>
        )}

        {currentSuccess && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 text-xs animate-in fade-in slide-in-from-top-1">
            <CheckCircle2 size={14} />
            <p>{currentSuccess}</p>
          </div>
        )}

        <Button
          type="submit"
          disabled={isLogin ? isLoginPending : isRegisterPending}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl py-6 text-sm transition-all duration-200 shadow-lg shadow-red-600/20 hover:shadow-red-600/40"
        >
          {isLogin
            ? (isLoginPending ? <Loader2 className="animate-spin w-5 h-5" /> : "Zaloguj się")
            : (isRegisterPending ? <Loader2 className="animate-spin w-5 h-5" /> : "Zarejestruj się")
          }
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-800"></div>
        </div>
        <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
          <span className="px-4 bg-background text-zinc-500">lub kontynuuj z</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => loginWithGoogle()}
          className="w-full flex items-center justify-center gap-3 bg-background hover:bg-zinc-900 border border-zinc-800 text-white rounded-xl py-6 text-sm transition-all group"
        >
          <Chrome className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
          <span>Google</span>
        </Button>
      </div>

      <p className="mt-6 text-center text-zinc-400 text-sm">
        {isLogin ? "Nie masz konta?" : "Masz już konto?"}{" "}
        <Button
          variant="link"
          onClick={toggleMode}
          className="text-red-600 hover:text-red-500 font-semibold transition-colors hover:underline decoration-red-600/30 underline-offset-4 p-0 h-auto"
        >
          {isLogin ? "Zarejestruj się" : "Zaloguj się"}
        </Button>
      </p>
    </div>
  );
}
