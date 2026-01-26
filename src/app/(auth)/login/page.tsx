
import AuthForm from "@/components/AuthForm";

export default function LoginPage() {
    return (
        <div className="min-h-screen w-full flex items-center justify-center relative selection:bg-red-600 selection:text-white">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

            <div className="relative z-10 w-full flex flex-col items-center px-4">
                <AuthForm />
            </div>
        </div>
    );
}
