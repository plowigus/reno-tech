import AuthForm from "@/components/AuthForm";

export default function LoginPage() {
    return (
        <div className="flex flex-col items-center w-full">
            <AuthForm initialTab="login" />
        </div>
    );
}