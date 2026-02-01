import { create } from "zustand";

interface ActiveState {
    members: string[]; // List of online User IDs
    addMember: (id: string) => void;
    removeMember: (id: string) => void;
    setMembers: (ids: string[]) => void;
}

export const useActiveList = create<ActiveState>((set) => ({
    members: [],
    addMember: (id) => set((state) => ({ members: [...state.members, id] })),
    removeMember: (id) => set((state) => ({ members: state.members.filter((m) => m !== id) })),
    setMembers: (ids) => set({ members: ids }),
}));
