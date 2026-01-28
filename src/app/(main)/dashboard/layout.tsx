import { auth } from "@/auth";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-background pt-32 pb-12 px-4">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
                {/* Sidebar */}
                <aside className="hidden lg:block w-64 shrink-0">
                    <DashboardNav role={session.user.role} />
                </aside>

                {/* Main Content */}
                <main className="flex-1 bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
