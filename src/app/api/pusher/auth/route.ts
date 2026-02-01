import { auth } from "@/auth";
import { pusherServer } from "@/lib/pusher";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await auth();

    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.formData();
    const socketId = body.get("socket_id") as string;
    const channel = body.get("channel_name") as string;

    // User data exposed to other clients
    const data = {
        user_id: session.user.id,
        user_info: {
            name: session.user.name,
            image: session.user.image
        }
    };

    const authResponse = pusherServer.authorizeChannel(socketId, channel, data);
    // pusherServer.authorizeChannel actually returns a response object (JSON), but Next's NextResponse.json wraps it.
    // However, authorizeChannel returns a plain object { auth: string, channel_data?: string }.
    return NextResponse.json(authResponse);
}
