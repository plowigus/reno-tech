import { DashboardNav } from "@/components/dashboard/DashboardNav";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-black pt-32 pb-12 px-4">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
                {/* Sidebar */}
                <aside className="hidden lg:block w-64 flex-shrink-0">
                    <DashboardNav />
                </aside>

                {/* Main Content */}
                <main className="flex-1 bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
