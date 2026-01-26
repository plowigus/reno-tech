
import AuthForm from "@/components/AuthForm";

export default function RegisterPage() {
    return (
        <div className="flex flex-col items-center w-full">
            <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Utwórz konto</h2>
            <p className="text-zinc-400 mb-8 text-center">Wypełnij formularz, aby dołączyć.</p>
            <AuthForm initialTab="register" />
        </div>
    );
}
