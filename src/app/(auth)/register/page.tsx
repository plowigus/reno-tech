import AuthForm from "@/components/AuthForm";

export default function RegisterPage() {
    return (
        <div className="flex flex-col items-center w-full">
            <AuthForm initialTab="register" />
        </div>
    );
}