export interface Message {
    id: string;
    content: string;
    senderId: string;
    senderName?: string | null;
    senderImage?: string | null;
    createdAt: Date | string;
    reactions?: {
        messageId: string;
        userId: string;
        emoji: string;
        user?: { id: string; name: string | null };
    }[];
}
