import { useEffect, useState } from "react";
import { useActiveList } from "./use-active-store";
import { Channel, Members } from "pusher-js";
import { pusherClient } from "@/lib/pusher";

export const useActiveChannel = () => {
    const { setMembers, addMember, removeMember } = useActiveList();
    const [activeChannel, setActiveChannel] = useState<Channel | null>(null);

    useEffect(() => {
        let channel = activeChannel;

        if (!channel) {
            // presence-chat is the channel name we are agreeing on
            channel = pusherClient.subscribe("presence-chat");
            setActiveChannel(channel);
        }

        channel.bind("pusher:subscription_succeeded", (members: Members) => {
            const initialMembers: string[] = [];
            // members is a Pusher Class, 'each' iterates over them
            members.each((member: any) => initialMembers.push(member.id));
            setMembers(initialMembers);
        });

        channel.bind("pusher:member_added", (member: any) => {
            addMember(member.id);
        });

        channel.bind("pusher:member_removed", (member: any) => {
            removeMember(member.id);
        });

        return () => {
            if (activeChannel) {
                pusherClient.unsubscribe("presence-chat");
                setActiveChannel(null);
            }
        };
    }, [activeChannel, setMembers, addMember, removeMember]);
};
