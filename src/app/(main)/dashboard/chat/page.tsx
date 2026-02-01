import { MessageSquareDashed } from "lucide-react";

export default function ChatPage() {
    return (
        <div className="h-full flex flex-col items-center justify-center text-zinc-500 gap-4">
            <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center">
                <MessageSquareDashed className="w-8 h-8 opacity-50" />
            </div>
            <p className="text-sm">Wybierz rozmowę z listy, aby rozpocząć czat.</p>
        </div>
    );
}
