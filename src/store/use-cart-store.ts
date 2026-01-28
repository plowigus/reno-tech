import { create } from 'zustand';

interface CartStore {
    isOpen: boolean;
    items: any[]; // Using any[] for now to avoid circular deps or type duplication, ideally share types
    onOpen: () => void;
    onClose: () => void;
    setItems: (items: any[]) => void;
}

export const useCartStore = create<CartStore>((set) => ({
    isOpen: false,
    items: [],
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false }),
    setItems: (items) => set({ items }),
}));
