import { auth } from "@/auth";
import { pusherServer } from "@/lib/pusher";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    console.log("[Pusher Auth] Request received");
    // 1. Sprawdź sesję
    const session = await auth();

    if (!session?.user?.id) {
        console.warn("[Pusher Auth] Unauthorized");
        return new NextResponse("Unauthorized", { status: 401 });
    }

    // 2. Bezpieczne parsowanie body (x-www-form-urlencoded)
    // Pusher wysyła dane jako formularz, nie JSON
    const text = await req.text();
    console.log("[Pusher Auth] Body text:", text);
    const params = new URLSearchParams(text);

    const socketId = params.get("socket_id");
    const channel = params.get("channel_name");

    console.log("[Pusher Auth] Params:", { socketId, channel });

    if (!socketId || !channel) {
        console.error("[Pusher Auth] Missing params");
        return new NextResponse("Missing socket_id or channel_name", { status: 400 });
    }

    // 3. Dane użytkownika widoczne dla innych (np. na liście online)
    const userData = {
        user_id: session.user.id,
        user_info: {
            name: session.user.name,
            image: session.user.image,
        },
    };

    try {
        // 4. Autoryzacja w Pusherze
        const authResponse = pusherServer.authorizeChannel(socketId, channel, userData);
        console.log("[Pusher Auth] Success");
        return NextResponse.json(authResponse);
    } catch (error) {
        console.error("Pusher Auth Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
