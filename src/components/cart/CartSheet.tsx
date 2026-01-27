"use client";

import { useCart } from "@/context/CartContext";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import Image from "next/image";
import { useEffect, useState, useOptimistic, useTransition } from "react";
import { getCart, removeFromCart, updateItemQuantity } from "@/app/actions/cart-actions";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CartItem {
    id: string;
    quantity: number;
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
    const { isOpen, closeCart, refreshCart } = useCart();
    const [cart, setCart] = useState<CartData | null>(null);
    const [isPending, startTransition] = useTransition();

    // Fetch cart when opened
    useEffect(() => {
        if (isOpen) {
            getCart().then((data: any) => setCart(data));
        }
    }, [isOpen]);

    const calculateTotal = (items: CartItem[]) => {
        return items.reduce((total, item) => {
            return total + Number(item.product.price) * item.quantity;
        }, 0);
    };

    const handleUpdateQuantity = async (itemId: string, newQty: number) => {
        if (!cart) return;

        // Optimistic update logic could go here, but for now simple state update
        const updatedItems = cart.items.map(item =>
            item.id === itemId ? { ...item, quantity: newQty } : item
        ).filter(item => item.quantity > 0);

        setCart({ ...cart, items: updatedItems });

        const result = await updateItemQuantity(itemId, newQty);
        refreshCart(); // Update global count
        if (!result.success) {
            toast.error("Błąd aktualizacji koszyka");
            // Revert would be needed here ideally
            getCart().then((data: any) => setCart(data));
        }
    };

    const handleRemove = async (itemId: string) => {
        if (!cart) return;

        const updatedItems = cart.items.filter(item => item.id !== itemId);
        setCart({ ...cart, items: updatedItems });

        const result = await removeFromCart(itemId);
        refreshCart(); // Update global count
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
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={closeCart}
            />

            {/* Sheet */}
            <div className="relative w-full max-w-md bg-zinc-900 h-full border-l border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <ShoppingBag className="text-red-500" />
                        Twój Koszyk
                    </h2>
                    <button onClick={closeCart} className="text-zinc-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {cart?.items && cart.items.length > 0 ? (
                        cart.items.map((item) => (
                            <div key={item.id} className="flex gap-4">
                                <div className="relative w-20 h-24 bg-white/5 rounded-md overflow-hidden shrink-0 border border-white/10">
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
                                            <h3 className="text-white font-medium text-sm line-clamp-2">
                                                {item.product.name}
                                            </h3>
                                            <button
                                                onClick={() => handleRemove(item.id)}
                                                className="text-zinc-500 hover:text-red-500 transition-colors ml-2"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                        <p className="text-zinc-400 text-sm mt-1">
                                            {Number(item.product.price).toFixed(2)} PLN
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center border border-white/10 rounded-lg bg-black/20">
                                            <button
                                                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                                className="p-1 hover:text-red-500 transition-colors disabled:opacity-50"
                                                disabled={item.quantity <= 1}
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="text-white text-sm w-6 text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                                className="p-1 hover:text-red-500 transition-colors"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-4">
                            <ShoppingBag size={48} className="opacity-20" />
                            <p>Twój koszyk jest pusty</p>
                            <button
                                onClick={closeCart}
                                className="text-red-500 hover:text-red-400 text-sm font-medium"
                            >
                                Wróć do sklepu
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {cart?.items && cart.items.length > 0 && (
                    <div className="p-6 border-t border-white/10 bg-zinc-900">
                        <div className="flex justify-between items-center mb-4 text-white">
                            <span className="text-zinc-400">Suma</span>
                            <span className="text-xl font-bold font-mono">
                                {calculateTotal(cart.items).toFixed(2)} PLN
                            </span>
                        </div>
                        <button className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-zinc-200 transition-colors uppercase tracking-wide">
                            Przejdź do kasy
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
