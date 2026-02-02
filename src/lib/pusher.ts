import PusherServer from "pusher";
import PusherClient from "pusher-js";

export const pusherServer = new PusherServer({
    appId: process.env.PUSHER_APP_ID!,
    key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
    secret: process.env.PUSHER_SECRET!,
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    useTLS: true,
});

/**
 * Singleton pattern for PusherClient to prevent multiple connections
 * during hot-reloading in development.
 */
const globalForPusher = globalThis as unknown as { pusherClient: PusherClient | undefined };

export const pusherClient = globalForPusher.pusherClient ?? new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    authEndpoint: "/api/pusher/auth",
});

if (process.env.NODE_ENV !== "production") globalForPusher.pusherClient = pusherClient;
