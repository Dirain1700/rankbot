import type { Client } from "../src/Client";
import type { Message } from "../src/Message";
import type { Room } from "../src/Room";
import type { User } from "../src/User";

export interface MessageInput<T extends User | Room> {
    author: User;
    content: string;
    target: T;
    raw: string;
    type: "Room" | "PM";
    time: number;
    client: Client;
}

export interface MessageWaits<T extends User | Room> {
    timestamp: string;
    roomid: T extends Room ? string : undefined;
    userid: T extends User ? string : undefined;
    messages: Array<Message<T>>;
    filter: (m: Message<T>) => boolean;
    max: number;
    time: number;
    resolve: (m: Message<T>[]) => void;
    reject: (m: Message<T>[] | null) => void;
    timeout: NodeJS.Timeout | undefined;
}

export interface awaitMessageOptions<T extends User | Room = User | Room> {
    filter: (message: Message<T>) => boolean;
    max: number;
    time: number;
}
