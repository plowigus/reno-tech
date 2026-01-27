import { create } from 'zustand';

interface CartStore {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
}

export const useCartStore = create<CartStore>((set) => ({
    isOpen: false,
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false }),
}));
