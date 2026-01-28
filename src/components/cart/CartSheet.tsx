"use client";

import { useCartStore } from "@/store/use-cart-store";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { getCart, removeFromCart, updateItemQuantity } from "@/app/actions/cart-actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface CartItem {
    id: string;
    quantity: number;
    size: string | null;
    product: {
        id: string;
        name: string;
        price: string | number;
        image: string;
        slug: string;
        category: string;
    };
}

interface CartData {
    id: string;
    items: CartItem[];
}

export function CartSheet() {
    const { isOpen, onClose } = useCartStore();
    const [cart, setCart] = useState<CartData | null>(null);
    const [isPending, startTransition] = useTransition();

    // Fetch cart when opened
    useEffect(() => {
        if (isOpen) {
            getCart().then((data: any) => setCart(data));
        }
    }, [isOpen]);

    const calculateSubtotal = (items: CartItem[]) => {
        return items.reduce((total, item) => {
            return total + Number(item.product.price) * item.quantity;
        }, 0);
    };

    const shippingCost = 9.99;
    const subtotal = cart?.items ? calculateSubtotal(cart.items) : 0;
    const total = subtotal + shippingCost;

    const handleUpdateQuantity = async (itemId: string, newQty: number) => {
        if (!cart) return;

        // Optimistic update
        const updatedItems = cart.items.map(item =>
            item.id === itemId ? { ...item, quantity: newQty } : item
        ).filter(item => item.quantity > 0);

        setCart({ ...cart, items: updatedItems });

        const result = await updateItemQuantity(itemId, newQty);

        if (!result.success) {
            toast.error("Błąd aktualizacji koszyka");
            getCart().then((data: any) => setCart(data));
        } else {
            // In a real app we might re-fetch here to be safe, but optimistic is fine for now
            // Badge updates via revalidatePath("/") in action
        }
    };

    const handleRemove = async (itemId: string) => {
        if (!cart) return;

        const updatedItems = cart.items.filter(item => item.id !== itemId);
        setCart({ ...cart, items: updatedItems });

        const result = await removeFromCart(itemId);

        if (!result.success) {
            toast.error("Błąd usuwania produktu");
            getCart().then((data: any) => setCart(data));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-background/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Sheet */}
            <div className="relative w-full max-w-md bg-card h-full border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <ShoppingBag className="text-red-500" />
                        Twój Koszyk
                    </h2>
                    <Button variant="ghost" size="icon" onClick={onClose} className="text-zinc-400 hover:text-white hover:bg-transparent">
                        <X size={24} />
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {cart?.items && cart.items.length > 0 ? (
                        cart.items.map((item) => (
                            <div key={item.id} className="flex gap-4">
                                <div className="relative w-20 h-24 bg-foreground/5 rounded-md overflow-hidden shrink-0 border border-border">
                                    <Image
                                        src={item.product.image}
                                        alt={item.product.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-white font-medium text-sm line-clamp-2">
                                                    {item.product.name}
                                                </h3>
                                                {item.size && (
                                                    <p className="text-xs text-zinc-500 mt-1 font-mono">
                                                        Rozmiar: {item.size}
                                                    </p>
                                                )}
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleRemove(item.id)}
                                                className="text-zinc-500 hover:text-red-500 hover:bg-transparent h-auto p-0 ml-2"
                                            >
                                                <X size={16} />
                                            </Button>
                                        </div>
                                        <p className="text-zinc-400 text-sm mt-1">
                                            {Number(item.product.price).toFixed(2)} PLN
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center border border-white/10 rounded-lg bg-background/20">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                                className="p-1 hover:text-red-500 hover:bg-transparent h-6 w-6"
                                                disabled={item.quantity <= 1}
                                            >
                                                <Minus size={14} />
                                            </Button>
                                            <span className="text-white text-sm w-6 text-center">{item.quantity}</span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                                className="p-1 hover:text-red-500 hover:bg-transparent h-6 w-6"
                                            >
                                                <Plus size={14} />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-4">
                            <ShoppingBag size={48} className="opacity-20" />
                            <p>Twój koszyk jest pusty</p>
                            <Button
                                variant="link"
                                onClick={onClose}
                                className="text-red-500 hover:text-red-400 text-sm font-medium h-auto p-0"
                            >
                                Wróć do sklepu
                            </Button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {cart?.items && cart.items.length > 0 && (
                    <div className="p-6 border-t border-border bg-card space-y-4">
                        <div className="flex justify-between items-center text-sm text-zinc-400">
                            <span>Suma częściowa</span>
                            <span>{subtotal.toFixed(2)} PLN</span>
                        </div>
                        <div className="flex justify-between items-center text-sm text-zinc-400">
                            <span>Dostawa</span>
                            <span>{shippingCost.toFixed(2)} PLN</span>
                        </div>
                        <div className="flex justify-between items-center text-foreground pt-4 border-t border-border">
                            <span className="font-bold">Do zapłaty</span>
                            <span className="text-xl font-bold font-mono text-red-500">
                                {total.toFixed(2)} PLN
                            </span>
                        </div>
                        <Button
                            asChild
                            className="w-full text-center bg-white text-black font-bold py-6 rounded-lg hover:bg-zinc-200 transition-colors uppercase tracking-wide"
                        >
                            <Link
                                href="/checkout"
                                onClick={onClose}
                            >
                                Przejdź do kasy
                            </Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
