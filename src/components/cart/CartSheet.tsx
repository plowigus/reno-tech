"use client";

import { useCartStore } from "@/store/use-cart-store";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { getCart, removeFromCart, updateItemQuantity } from "@/app/actions/cart-actions";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
    SheetPortal, // If explicit portal is needed, though SheetContentnpm has it. User requested explicit awareness.
} from "@/components/ui/sheet";

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

export function CartSheet() {
    const { isOpen, onOpen, onClose, items, setItems } = useCartStore();
    const [isPending, startTransition] = useTransition();

    // Fetch cart when opened to ensure freshness
    useEffect(() => {
        if (isOpen) {
            getCart().then((data: any) => {
                if (data && data.items) {
                    setItems(data.items);
                }
            });
        }
    }, [isOpen, setItems]);

    const calculateSubtotal = (items: CartItem[]) => {
        return items.reduce((total, item) => {
            return total + Number(item.product.price) * item.quantity;
        }, 0);
    };

    const shippingCost = 9.99;
    const subtotal = calculateSubtotal(items as CartItem[]);
    const total = subtotal + shippingCost;

    const handleUpdateQuantity = async (itemId: string, newQty: number) => {
        // Optimistic update
        const updatedItems = items.map((item: any) =>
            item.id === itemId ? { ...item, quantity: newQty } : item
        ).filter((item: any) => item.quantity > 0);

        setItems(updatedItems);

        const result = await updateItemQuantity(itemId, newQty);

        if (!result.success) {
            toast.error("Błąd aktualizacji koszyka");
            // Revert/Refetch on error
            getCart().then((data: any) => { if (data) setItems(data.items) });
        }
    };

    const handleRemove = async (itemId: string) => {
        const updatedItems = items.filter((item: any) => item.id !== itemId);
        setItems(updatedItems);

        const result = await removeFromCart(itemId);

        if (!result.success) {
            toast.error("Błąd usuwania produktu");
            getCart().then((data: any) => { if (data) setItems(data.items) });
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col border-l border-border bg-card">
                <SheetHeader className="p-6 border-b border-border">
                    <SheetTitle className="flex items-center gap-2 text-xl font-bold text-white">
                        <ShoppingBag className="text-red-500" />
                        Twój Koszyk
                    </SheetTitle>
                    <SheetDescription className="hidden">
                        Lista produktów w Twoim koszyku
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {items && items.length > 0 ? (
                        items.map((item: any) => (
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
                                                className="text-zinc-500 hover:text-red-500 hover:bg-transparent h-auto p-0 ml-2 cursor-pointer"
                                            >
                                                <X size={16} />
                                                <span className="sr-only">Usuń</span>
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

                {items && items.length > 0 && (
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
                        <Link
                            href="/checkout"
                            onClick={onClose}
                            className={cn(buttonVariants(), "w-full text-center bg-white text-black font-bold py-6 rounded-lg hover:bg-zinc-200 transition-colors uppercase tracking-wide")}
                        >
                            Przejdź do kasy
                        </Link>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
