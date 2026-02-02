"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, UserPlus, Check, X, MessageSquare, Trash2, Loader2 } from "lucide-react";
import { sendFriendRequest, acceptFriendRequest, removeFriendRequest, removeFriend, searchUsers } from "@/app/actions/friend-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

interface User {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
}

interface FriendRequestReceived {
    senderId: string;
    sender: {
        name: string | null;
        image: string | null;
    };
}

interface FriendRequestSent {
    receiverId: string;
    receiver: {
        name: string | null;
        image: string | null;
    };
}

interface FriendsViewProps {
    friends: User[];
    requests: {
        sent: FriendRequestSent[];
        received: FriendRequestReceived[];
    };
}

export function FriendsView({ friends, requests }: FriendsViewProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const router = useRouter();

    const debouncedSearch = useDebouncedCallback(async (query: string) => {
        if (query.length < 3) return;

        setIsSearching(true);
        try {
            const users = await searchUsers(query);
            // Ensure result matches User interface or map it (searchUsers likely returns similar shape)
            setSearchResults(users as User[]);
        } catch (error) {
            toast.error("Błąd wyszukiwania.");
        } finally {
            setIsSearching(false);
        }
    }, 300);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);
        if (value.length >= 3) {
            setIsSearching(true);
            debouncedSearch(value);
        } else {
            setSearchResults([]);
        }
    };

    const handleManualSearch = async () => {
        if (searchQuery.length < 3) return;
        debouncedSearch.cancel();

        setIsSearching(true);
        try {
            const users = await searchUsers(searchQuery);
            setSearchResults(users as User[]);
        } catch (error) {
            toast.error("Błąd wyszukiwania.");
        } finally {
            setIsSearching(false);
        }
    };

    const handleSendRequest = async (id: string) => {
        const res = await sendFriendRequest(id);
        if (res.error) toast.error(res.error);
        else {
            toast.success("Zaproszenie wysłane!");
            setSearchResults(prev => prev.filter(u => u.id !== id));
            router.refresh();
        }
    }

    const handleAccept = async (id: string) => {
        const res = await acceptFriendRequest(id);
        if (res.error) toast.error(res.error);
        else {
            toast.success("Mamy nowego znajomego!");
            router.refresh();
        }
    }

    const handleReject = async (id: string) => {
        await removeFriendRequest(id);
        router.refresh();
    }

    const handleRemoveFriend = async (id: string) => {
        if (confirm("Czy na pewno chcesz usunąć tę osobę ze znajomych?")) {
            await removeFriend(id);
            toast.success("Usunięto znajomego.");
            router.refresh();
        }
    }

    return (
        <Tabs defaultValue="friends" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-zinc-900 border border-zinc-800">
                <TabsTrigger value="friends">Moi Znajomi ({friends.length})</TabsTrigger>
                <TabsTrigger value="requests">
                    Zaproszenia
                    {requests.received.length > 0 && <span className="ml-2 bg-red-600 text-white text-[10px] px-1.5 rounded-full">{requests.received.length}</span>}
                </TabsTrigger>
                <TabsTrigger value="search">Szukaj Osób</TabsTrigger>
            </TabsList>

            {/* 1. LISTA ZNAJOMYCH */}
            <TabsContent value="friends" className="mt-4 space-y-4">
                <Card className="bg-zinc-950 border-zinc-800">
                    <CardHeader>
                        <CardTitle>Twoja ekipa</CardTitle>
                        <CardDescription>Osoby, z którymi możesz pisać.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {friends.length === 0 ? (
                            <div className="text-center py-8 text-zinc-500">Jeszcze nikogo tu nie ma. Dodaj kogoś!</div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2">
                                {friends.map((friend) => (
                                    <div key={friend.id} className="flex items-center justify-between p-3 rounded-lg border border-zinc-800 bg-zinc-900/50">
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={friend.image || undefined} />
                                                <AvatarFallback>{friend.name?.[0]}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium text-sm">{friend.name}</p>
                                                <p className="text-xs text-zinc-500">{friend.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                title="Napisz"
                                                onClick={async () => {
                                                    try {
                                                        const res = await import("@/app/actions/chat-actions").then(mod => mod.startConversation(friend.id));
                                                        if (res.error) {
                                                            toast.error(res.error);
                                                        } else if (res.conversationId) {
                                                            router.push(`/dashboard/chat/${res.conversationId}`);
                                                        }
                                                    } catch (error) {
                                                        toast.error("Wystąpił błąd podczas tworzenia rozmowy.");
                                                    }
                                                }}
                                            >
                                                <MessageSquare className="w-4 h-4 text-blue-400" />
                                            </Button>
                                            <Button size="icon" variant="ghost" onClick={() => handleRemoveFriend(friend.id)} title="Usuń">
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>

            {/* 2. ZAPROSZENIA */}
            <TabsContent value="requests" className="mt-4 space-y-4">
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Otrzymane */}
                    <Card className="bg-zinc-950 border-zinc-800">
                        <CardHeader><CardTitle>Otrzymane ({requests.received.length})</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            {requests.received.map((req) => (
                                <div key={req.senderId} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Avatar className="w-8 h-8">
                                            <AvatarImage src={req.sender.image || undefined} />
                                            <AvatarFallback>?</AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm font-medium">{req.sender.name}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" onClick={() => handleAccept(req.senderId)} className="bg-green-600 hover:bg-green-700"><Check className="w-4 h-4" /></Button>
                                        <Button size="sm" variant="ghost" onClick={() => handleReject(req.senderId)} className="hover:text-red-500"><X className="w-4 h-4" /></Button>
                                    </div>
                                </div>
                            ))}
                            {requests.received.length === 0 && <p className="text-sm text-zinc-500">Brak nowych zaproszeń.</p>}
                        </CardContent>
                    </Card>

                    {/* Wysłane */}
                    <Card className="bg-zinc-950 border-zinc-800">
                        <CardHeader><CardTitle>Wysłane ({requests.sent.length})</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            {requests.sent.map((req) => (
                                <div key={req.receiverId} className="flex items-center justify-between opacity-70">
                                    <div className="flex items-center gap-2">
                                        <Avatar className="w-8 h-8">
                                            <AvatarImage src={req.receiver.image || undefined} />
                                            <AvatarFallback>?</AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm font-medium">{req.receiver.name}</span>
                                    </div>
                                    <Button size="sm" variant="ghost" onClick={() => handleReject(req.receiverId)}>Anuluj</Button>
                                </div>
                            ))}
                            {requests.sent.length === 0 && <p className="text-sm text-zinc-500">Brak wysłanych zaproszeń.</p>}
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>

            {/* 3. WYSZUKIWARKA */}
            <TabsContent value="search" className="mt-4">
                <Card className="bg-zinc-950 border-zinc-800">
                    <CardHeader>
                        <CardTitle>Znajdź ludzi</CardTitle>
                        <CardDescription>Wpisz nazwę użytkownika lub email.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Szukaj..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
                                className="bg-zinc-900 border-zinc-800"
                            />
                            <Button onClick={handleManualSearch} disabled={isSearching || searchQuery.length < 3}>
                                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                            </Button>
                        </div>

                        <div className="space-y-2">
                            {searchResults.map((user) => (
                                <div key={user.id} className="flex items-center justify-between p-3 border border-zinc-800 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={user.image || undefined} />
                                            <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium text-sm">{user.name}</p>
                                            <p className="text-xs text-zinc-500">{user.email}</p>
                                        </div>
                                    </div>
                                    <Button size="sm" variant="secondary" onClick={() => handleSendRequest(user.id)}>
                                        <UserPlus className="w-4 h-4 mr-2" />
                                        Dodaj
                                    </Button>
                                </div>
                            ))}
                            {searchResults.length === 0 && searchQuery.length > 3 && !isSearching && (
                                <p className="text-center text-zinc-500">Nikogo nie znaleziono.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}
