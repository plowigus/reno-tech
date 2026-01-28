import { Footer } from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { CartSheet } from "@/components/cart/CartSheet";


export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Navbar />
            <CartSheet />
            <main className="min-h-screen bg-background relative">
                {children}
            </main>
            <Footer />

        </>
    );
}