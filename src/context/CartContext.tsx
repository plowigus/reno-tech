"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getCart } from "@/app/actions/cart-actions";

interface CartContextType {
    isOpen: boolean;
    openCart: () => void;
    closeCart: () => void;
    cartCount: number;
    refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [cartCount, setCartCount] = useState(0);

    const openCart = () => setIsOpen(true);
    const closeCart = () => setIsOpen(false);

    const refreshCart = async () => {
        const cart = await getCart();
        if (cart && cart.items) {
            const count = cart.items.reduce((acc: number, item: any) => acc + item.quantity, 0);
            setCartCount(count);
        } else {
            setCartCount(0);
        }
    };

    useEffect(() => {
        refreshCart();
    }, []);

    return (
        <CartContext.Provider value={{ isOpen, openCart, closeCart, cartCount, refreshCart }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
