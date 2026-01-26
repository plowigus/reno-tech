
export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen w-full flex bg-zinc-950">
            {/* Left Side - Visual/Branding (Desktop Only) */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-black items-center justify-center">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />
                <div className="relative z-10 p-12 text-center">
                    <h1 className="text-4xl font-bold text-white tracking-tight mb-4">RENO TECH</h1>
                    <p className="text-zinc-400 text-lg max-w-md mx-auto">
                        Profesjonalna elektronika samochodowa.
                        <br />
                        Dołącz do grona zadowolonych klientów.
                    </p>

                    {/* Decorative Red Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/20 rounded-full blur-[100px] -z-10" />
                </div>
            </div>

            {/* Right Side - Form Area */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative">
                {/* Mobile Background decoration (subtle) */}
                <div className="lg:hidden absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20 pointer-events-none" />

                <div className="w-full max-w-md relative z-10">
                    {children}
                </div>
            </div>
        </div>
    );
}
