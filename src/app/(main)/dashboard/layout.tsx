import { DashboardNav } from "@/components/dashboard/DashboardNav";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-black">
            {/* Sidebar Navigation */}
            <DashboardNav />

            {/* Main Content Area */}
            <main className="flex-1 lg:pl-64">
                <div className="p-8 pt-24 lg:pt-8 min-h-screen">
                    {children}
                </div>
            </main>
        </div>
    );
}
