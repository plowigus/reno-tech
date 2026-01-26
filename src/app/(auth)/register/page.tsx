import AuthForm from "@/components/AuthForm";

export default function RegisterPage() {
    return (
        <div className="flex flex-col items-center w-full">
            {/* Przekazujemy initialTab="register", żeby formularz wiedział, że ma pokazać rejestrację */}
            <AuthForm initialTab="register" />
        </div>
    );
}