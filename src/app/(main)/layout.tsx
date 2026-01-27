import { Footer } from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { CartProvider } from "@/context/CartContext";
import { CartSheet } from "@/components/cart/CartSheet";

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <CartProvider>
            <Navbar />
            <main className="min-h-screen relative">
                {children}
            </main>
            <Footer />
            <CartSheet />
        </CartProvider>
    );
}