"use strict";

import { EventEmitter } from "node:events";
import * as https from "node:https";
import * as querystring from "node:querystring";
import * as url from "node:url";
import * as util from "node:util";

import { WebSocket } from "ws";

import { ClientUser } from "./ClientUser";
import { TimeoutError, AccessError, PSAPIError } from "./Error";
import { Message } from "./Message";
import { BattleRoom, Room } from "./Room";
import { Tools } from "./Tools";
import { Tournament } from "./Tour";
import { User } from "./User";

import type { IncomingMessage } from "http";
import type * as ws from "ws";

import type {
    ClientOptions,
    ClientEvents,
    ClientEventNames,
    IOutGoingMessage,
    IRoomOutGoingMessageOptions,
    IUserOutGoingMessageOptions,
    PromisedRoom,
    PromisedUser,
    PendingMessage,
    StatusType,
    ServerConfig,
    PostLoginOptions,
} from "../types/Client";
import type { UserSettings } from "../types/ClientUser";
import type { MessageInput } from "../types/Message";
import type { IBattleRoom, RoomOptions } from "../types/Room";
import type { TourUpdateData, EliminationBracket, RoundRobinBracket, TourEndData } from "../types/Tour";
import type { UserOptions } from "../types/User";
import type { Dict } from "../types/utils";

const MAIN_HOST = "sim3.psim.us";
const ROOM_FETCH_COOLDOWN = 10000;
const USER_FETCH_COOLDOWN = 10000;
const Events: ClientEventNames = {
    READY: "ready",
    QUERY_RESPONSE: "queryResponse",
    BATTLE_LIST: "battleList",
    BATTLE_START: "battleStart",
    BATTLE_END: "battleEnd",
    RAW_DATA: "rawData",
    MODCHAT: "modchat",
    MODJOIN: "modjoin",
    MESSAGE_CREATE: "messageCreate",
    COMMAND_EMIT: "commandEmit",
    MESSAGE_DELETE: "messageDelete",
    ROOM_USER_ADD: "roomUserAdd",
    ROOM_USER_REMOVE: "roomUserRemove",
    USER_RENAME: "userRename",
    CLIENT_ROOM_ADD: "clientRoomAdd",
    CLIENT_ROOM_REMOVE: "clientRoomRemove",
    TOUR_CREATE: "tourCreate",
    TOUR_UPDATE: "tourUpdate",
    TOUR_UPDATE_END: "tourUpdateEnd",
    TOUR_JOIN: "tourJoin",
    TOUR_LEAVE: "tourLeave",
    TOUR_REPLACE: "tourReplace",
    TOUR_BATTLE_START: "tourBattleStart",
    TOUR_BATTLE_END: "tourBattleEnd",
    TOUR_START: "tourStart",
    TOUR_END: "tourEnd",
    OPEN_HTML_PAGE: "openHtmlPage",
    CLOSE_HTML_PAGE: "closeHtmlPage",
    CHAT_ERROR: "chatError",
    CLIENT_ERROR: "clientError",
};

/* eslint-disable @typescript-eslint/no-non-null-assertion */

export class Client extends EventEmitter {
    private readonly options: ClientOptions = {};
    private loggedIn: boolean = false;
    readonly serverURL: string = "play.pokemonshowdown.com";
    readonly serverId: string = "showdown";
    readonly upkeepURL = new url.URL("https://play.pokemonshowdown.com/api/upkeep");
    readonly loginURL = new url.URL("https://play.pokemonshowdown.com/api/login");
    readonly mainServer: string = "play.pokemonshowdown.com";
    readonly messageThrottle = 3;
    private autoReconnectTimer: NodeJS.Timeout | null = null;
    throttleInterval: 25 | 100 | 600 = 600;
    ws: WebSocket | null = null;
    events = Events;
    user: ClientUser | null;
    status: StatusType = {
        connected: false,
        loggedIn: false,
        name: "",
        id: "",
    };
    connected: boolean = false;
    closed: boolean = true;
    trusted: boolean = false;
    formats: {
        [key: string]: string[];
    } = {};

    private sendTimer: NodeJS.Timeout | undefined = undefined;
    outGoingMessage: IOutGoingMessage<Room | User>[] = [];
    private userdetailsQueue: PromisedUser[] = [];
    private roominfoQueue: PromisedRoom[] = [];
    resolvedRoom: string[] = [];
    resolvedUser: string[] = [];
    private PromisedPM: PendingMessage[] = [];
    private PromisedChat: PendingMessage[] = [];
    private challstr: string = "";

    constructor(options: ClientOptions) {
        super();
        options.retryLogin ||= 15 * 1000;
        options.autoReconnect ||= 5 * 60 * 1000;
        this.options = options;
        const defineOptions = {
            enumerable: false,
            writable: true,
        };
        Object.defineProperties(this, {
            options: defineOptions,
            sendTimer: defineOptions,
            userdetailsQueue: defineOptions,
            roominfoQueue: defineOptions,
            outGoingMessage: defineOptions,
            resolvedRoom: defineOptions,
            resolvedUser: defineOptions,
            PromisedPM: defineOptions,
            PromisedChat: defineOptions,
            challstr: defineOptions,
        });
        this.user = null;
    }

    /* eslint-disable @typescript-eslint/no-explicit-any */
    public on<T extends keyof ClientEvents>(event: T, listener: (...args: ClientEvents[T]) => void): this;
    public on<U extends string | symbol>(event: Exclude<U, keyof ClientEvents>, listener: (...args: any[]) => void): this;
    public on<K extends string | symbol>(
        event: K extends keyof ClientEvents ? K : Exclude<K, keyof ClientEvents>,
        listener: (...args: any[]) => void
    ): this {
        return super.on(event, listener);
    }

    public once<T extends keyof ClientEvents>(event: T, listener: (...args: ClientEvents[T]) => void): this;
    public once<U extends string | symbol>(event: Exclude<U, keyof ClientEvents>, listener: (...args: any[]) => void): this;
    public once<K extends string | symbol>(
        event: K extends keyof ClientEvents ? K : Exclude<K, keyof ClientEvents>,
        listener: (...args: any[]) => void
    ): this {
        return super.once(event, listener);
    }

    public emit<T extends keyof ClientEvents>(event: T, ...args: ClientEvents[T]): boolean;
    // prettier-ignore
    public emit<U extends string | symbol>(
        event: Exclude<U, keyof ClientEvents>,
        ...args: unknown[]
    ): boolean;
    public emit<K extends string | symbol>(
        event: K extends keyof ClientEvents ? K : Exclude<K, keyof ClientEvents>,
        ...args: K extends keyof ClientEvents ? ClientEvents[K] : unknown[]
    ): boolean {
        return super.emit(event, ...args);
    }
    /* eslint-enable @typescript-eslint/no-explicit-any */

    public connect(re?: boolean): void {
        if (this.ws && this.ws.readyState === 1) return;
        const httpsOptions = {
            hostname: this.mainServer,
            path:
                "/crossdomain.php?" +
                querystring.stringify({
                    host: this.serverURL,
                    path: "",
                }),
            method: "GET",
            headers: {
                "Cache-Control": "no-cache",
            },
        };

        if (!re) console.log("Trying to connect to the server " + this.serverURL + "...");
        https
            .get(httpsOptions, (response: IncomingMessage) => {
                response.setEncoding("utf8");
                let data: string = "";
                response.on("data", (chunk: string) => {
                    data += chunk;
                });
                response.on("end", () => {
                    const configData = data.split("var config = ")[1];
                    if (configData) {
                        let config = JSON.parse(configData.split(";")[0] as string) as ServerConfig | string;

                        if (typeof config === "string") config = JSON.parse(config) as ServerConfig;
                        if (config.host) {
                            let address: string;
                            if (config.host === "showdown") {
                                address = "wss://" + MAIN_HOST + "/showdown/websocket";
                            } else {
                                address = "ws://" + config.host + ":" + (config.port || 8000) + "/showdown/websocket";
                            }

                            const wsOptions: ws.ClientOptions = {
                                maxPayload: 8 * 100 * 1024 * 1024,
                                perMessageDeflate: false,
                                headers: {
                                    "Cache-Control": "no-cache",
                                    "User-Agent": "ws",
                                },
                            };

                            this.ws = new WebSocket(address, [], wsOptions) as WebSocket;
                            this.connected = true;
                            this.closed = false;
                            this.setEventListeners();

                            if (!this.ws) {
                                this.ws = null;
                                console.log("Retrying login cause failed to establish WebSocket connection...");
                                return this.connect();
                            }
                            if (this.ws.readyState === 0) {
                                setTimeout(() => {
                                    if (this.ws!.readyState === 1) {
                                        return;
                                    }
                                    console.log("Retrying login cause the server had no response...");
                                    this.ws!.terminate();
                                    this.ws = null;
                                    this.connect();
                                }, 20 * 1000);
                            }

                            this.ws.on("message", (message: ws.MessageEvent) => {
                                // This should be allowed because message.data is probably Buffer or String
                                // eslint-disable-next-line @typescript-eslint/no-base-to-string
                                this.onMessage(message.toString());
                            });

                            this.ws.on("close", () => {
                                if (!this.closed) this.connect();
                            });
                        }
                    } else {
                        console.log(
                            `Error: failed to get data for server ${this.serverURL}; Retrying in ${(this.options.autoReconnect || 5 * 60 * 1000) / 1000}s...`
                        );

                        this.autoReconnectTimer = setTimeout(
                            () => {
                                this.autoReconnectTimer = null;
                                this.connect();
                            },
                            this.options.autoReconnect || 5 * 60 * 1000
                        );
                    }
                });
            })
            .on("error", (error) => {
                console.error("Error: " + error.message);
            });
    }

    public logout(): void {
        this.disconnect();
    }

    public disconnect(): void {
        if (!this.ws) return;
        this.ws.send("|/logout");
        this.connected = false;
        this.loggedIn = false;
        this.closed = true;
        this.ws.terminate();
        this.ws = null;
    }

    private setEventListeners(): void {
        if (!this.ws) return;
        if (this.options.openListener)
            this.ws.addEventListener(
                // @ts-expect-error open is open
                "open" as string,
                this.options.openListener.function,
                this.options.openListener.options ?? {}
            );
        if (this.options.messageListener)
            this.ws.addEventListener(
                // @ts-expect-error message isnt open
                "message" as string,
                this.options.messageListener.function,
                this.options.messageListener.options ?? {}
            );
        if (this.options.closeListener)
            this.ws.addEventListener(
                // @ts-expect-error close isnt open
                "close" as string,
                this.options.closeListener.function,
                this.options.closeListener.options ?? {}
            );
        if (this.options.errorListener)
            this.ws.addEventListener(
                // @ts-expect-error error isnt open
                "error" as string,
                this.options.errorListener.function,
                this.options.errorListener.options ?? {}
            );
        if (this.options.customListener) {
            for (const Listener of this.options.customListener) {
                // @ts-expect-error union isnt open
                this.ws.addEventListener(Listener.event as string, Listener.function, Listener.options ?? {});
            }
        }
    }

    private setMessageInterval(): void {
        const isPublicBot: boolean = (() => {
            if (!this.user) return false;
            if (this.user.group === "*") return true;
            return this.user.rooms.some((r) => r.visibility === "public" && r.isBot(this.user!.userid));
        })();

        const isTrusted: boolean = (() => {
            if (!this.user) return false;
            return this.user?.trusted ?? false;
        })();

        this.throttleInterval = isPublicBot ? 25 : isTrusted ? 100 : 600;
    }

    private login(name: string, password?: string): void {
        const options: PostLoginOptions = {
            hostname: this.loginURL.hostname,
            path: this.loginURL.pathname,
            agent: false,
            method: "",
        };
        let postData: string = "";
        if (password) {
            options.method = "POST";
            postData = querystring.stringify({
                serverid: this.serverId,
                act: "login",
                name: name,
                pass: password,
                challstr: this.challstr,
            });
            options.headers = {
                "Content-Type": "application/x-www-form-urlencoded",
                "Content-Length": postData.length,
            };
        } else {
            options.method = "GET";
            options.path +=
                "?" +
                querystring.stringify({
                    serverid: this.serverId,
                    act: "getassertion",
                    userid: Tools.toId(name),
                    challstr: this.challstr,
                });
        }

        const client = this;
        const request = https.request(options, (response: IncomingMessage) => {
            response.setEncoding("utf8");
            let data: string = "";
            let assertion: string;
            response.on("data", (chunk: string) => (data += chunk));
            response.on("end", function () {
                if (data.length < 50) {
                    if (data === ";") console.log("Failed to login. Specified account is registered or wrong password.");
                    else console.error("Failed to login: " + data);
                    if (client.options.retryLogin) {
                        console.log(`Retrying login in ${client.options.retryLogin / 1000}s.`);
                        setTimeout(client.login.bind(client), client.options.retryLogin, name, password);
                    }
                    return;
                }
                if (data.includes("heavy load")) {
                    console.log("The login server is under heavy load.");
                    if (client.options.retryLogin) {
                        console.log(`Retrying login in ${client.options.retryLogin / 1000}s.`);
                        setTimeout(client.login.bind(client), client.options.retryLogin, name, password);
                    }
                    return;
                }
                let responseData: { assertion?: string; username?: string; loggedin?: boolean } = {};
                try {
                    responseData = JSON.parse(data.substring(1)) as {
                        assertion?: string;
                        username?: string;
                        loggedin?: boolean;
                    };
                    if (responseData.assertion) {
                        assertion = responseData.assertion;
                    } else {
                        console.error(`Unable to login: ${JSON.stringify(responseData, null, 4)}`);
                        if (client.options.retryLogin) {
                            console.log(`Retrying login in ${client.options.retryLogin / 1000}s.`);
                            setTimeout(client.login.bind(client), client.options.retryLogin, name, password);
                        }
                        return;
                    }
                    //eslint-disable-next-line no-empty, @typescript-eslint/no-unused-vars
                } catch (e) {}
                console.log("Sending login trn...");
                if (assertion) client.ws!.send(`|/trn ${name},0,${assertion}`);
                setInterval(client.upkeep.bind(client), 10 * 60 * 1000);
            });
        });
        request.on("error", function (err) {
            console.error(`Login error: ${util.inspect(err)}`);
            if (client.options.retryLogin) {
                console.log(`Retrying login in ${client.options.retryLogin / 1000}s.`);
                setTimeout(client.login.bind(client), client.options.retryLogin, name, password);
            }
            return;
        });
        if (postData) request.write(postData);
        request.end();
    }

    upkeep(): void {
        const options: PostLoginOptions = {
            hostname: this.upkeepURL.hostname,
            path: this.upkeepURL.pathname,
            agent: false,
            method: "",
        };
        options.path +=
            "?" +
            querystring.stringify({
                act: "upkeep",
                challstr: this.challstr,
            });
        https.get(options, (response: IncomingMessage) => {
            response.setEncoding("utf8");

            let data: string = "";
            response.on("data", (chunk: string) => {
                data += chunk;
            });

            response.on("end", () => {
                if ((response.statusCode ?? 200) >= 400) {
                    this.emit(Events.CLIENT_ERROR, data);
                    this.disconnect();
                    Tools.sleep(3000)
                        .then(() => this.connect())
                        // Never happens
                        .catch(console.error);
                }
            });
        });
    }

    private runOutGoingMessage(): void {
        if (!this.ws || !this.ws.readyState) return;
        if (!this.outGoingMessage.length) {
            clearTimeout(this.sendTimer);
            this.sendTimer = undefined;
        }
        const arr = this.outGoingMessage.splice(
            0,
            this.outGoingMessage.length <= this.messageThrottle ? this.outGoingMessage.length : this.messageThrottle
        );

        for (const m of arr) {
            const { roomid, userid, type, raw, text, measure } = m;
            let expection = "";

            switch (type) {
                case "pm-chat":
                case "room-chat":
                    expection = raw ?? text.split("|").slice(1).join("|");
                    break;
                case "code":
                    expection = "!code";
                    break;
                case "command":
                    if (raw.charAt(0) === "/") expection = "";
                    else expection = (raw ?? text.split("|").slice(1).join("|")).split(" ")[0]!;
                    break;
                default:
                    console.error("Unrecognized message type " + type + " detected.");
            }
            if (measure) {
                let promise: PendingMessage;
                if (typeof userid === "string") {
                    promise = {
                        id: userid,
                        content: expection,
                        sentTime: Date.now(),
                        received: false,
                        onTimeout: function () {
                            if (this.received) return;
                            throw new TimeoutError("Request timeout: Failed to send a PM between " + userid);
                        },
                        onReject: function (error: Error) {
                            throw error;
                        },
                    };
                    this.PromisedPM.push(promise);
                } else {
                    promise = {
                        id: roomid!,
                        content: expection,
                        sentTime: Date.now(),
                        received: false,
                        onTimeout: function () {
                            if (this.received) return;
                            throw new TimeoutError("Request timeout: Failed to send a message to " + roomid);
                        },
                        onReject: function (error: Error) {
                            throw error;
                        },
                    };
                    this.PromisedChat.push(promise);
                }
                setTimeout(() => promise.onTimeout(), 3 * 1000);
            }
            if (text.startsWith("|/cmd ")) {
                const type = Tools.toId(text.split(" ")[1]!);
                let target = Tools.toRoomId(text.split(" ")[2]!);
                switch (type) {
                    case "userdetails": {
                        target = Tools.toId(target);
                        const user = global.Users.get(target);
                        if (user && Date.now() - user.lastFetchTime < USER_FETCH_COOLDOWN) {
                            const pUser = this.userdetailsQueue.find((e) => e.id === target);
                            if (pUser) pUser.resolve(user);
                            continue;
                        }
                        break;
                    }
                    case "roominfo": {
                        const room = global.Rooms.get(Tools.toRoomId(target));
                        if (room && Date.now() - room.lastFetchTime < ROOM_FETCH_COOLDOWN) {
                            const pRoom = this.roominfoQueue.find((e) => e.id === target);
                            if (pRoom) pRoom.resolve(room);
                            continue;
                        }
                        break;
                    }
                }
            }
            this.ws.send(text);
        }
    }

    send(message: IRoomOutGoingMessageOptions | IUserOutGoingMessageOptions): void {
        message.raw ??= "";
        if (message.type !== "code") {
            message.text = Tools.trim(message.text);
            message.raw = Tools.trim(message.raw);
        } else {
            message.text = message.text.trim();
            message.raw = message.raw.trim();
        }

        /* eslint-disable @typescript-eslint/no-explicit-any */
        function toRoom(options: IRoomOutGoingMessageOptions | IUserOutGoingMessageOptions): options is IRoomOutGoingMessageOptions {
            return (
                !!(options as any as IRoomOutGoingMessageOptions).roomid && (options as any as IRoomOutGoingMessageOptions).roomid !== ""
            );
        }
        function toUser(options: IRoomOutGoingMessageOptions | IUserOutGoingMessageOptions): options is IUserOutGoingMessageOptions {
            return (
                !!(options as any as IUserOutGoingMessageOptions).userid && (options as any as IUserOutGoingMessageOptions).userid !== ""
            );
        }
        /* eslint-enable @typescript-eslint/no-explicit-any */

        message.measure ??= false;

        if (toRoom(message)) {
            const room = this.getRoom(message.roomid);
            if (!room || !room.exists) throw new PSAPIError("ROOM_NONEXIST");
            message.type ??= "room-chat";
            this.outGoingMessage.push(message as IOutGoingMessage<Room>);
        } else if (toUser(message) && message.userid) {
            const user = this.getUser(message.userid);
            if (message.userid !== "" && (!user || !user.online)) throw new PSAPIError("USER_OFFLINE", message.userid);
            message.type ??= "pm-chat";
            this.outGoingMessage.push(message as IOutGoingMessage<User>);
        } else {
            message.type = "command";
            message.measure = false;
            this.outGoingMessage.push(message as IOutGoingMessage<User>);
        }

        if (!this.sendTimer) {
            this.runOutGoingMessage();
            this.sendTimer = setInterval(() => this.runOutGoingMessage(), this.throttleInterval);
        }
        return;
    }

    noreplySend(content: string): void {
        return this.send({
            userid: "",
            text: content,
            raw: "",
            type: "command",
            measure: false,
        });
    }

    joinRoom(roomid: string): void {
        roomid = Tools.toRoomId(roomid);
        if (!roomid) throw new PSAPIError("EMPTY", "Room");
        this.noreplySend("|/j " + roomid);
    }

    leaveRoom(roomid: string): void {
        roomid = Tools.toRoomId(roomid);
        if (!roomid) throw new PSAPIError("EMPTY", "Room");
        if (!global.Rooms.has(roomid)) throw new PSAPIError("ROOM_NONEXIST", roomid);
        this.noreplySend("|/leave " + roomid);
    }

    onMessage(message: string): void {
        const lines: string[] = message.trim().split("\n");
        let roomid: string;
        if (lines[0]!.startsWith(">")) {
            roomid = lines[0]!.substring(1).trim();
            lines.shift();
        } else roomid = "defaultRoom";

        const room: Room | null =
            roomid === "defaultRoom"
                ? null
                : new Room({
                      id: roomid,
                      roomid: roomid,
                      type: roomid.startsWith("battle-") ? "battle" : roomid.startsWith("view-") ? "html" : "chat",
                  });
        if (room && room.type === "battle") room.visibility = "public";

        for (let i = 0; i < lines.length; i++) {
            const line: string | undefined = lines[i]!.trim();
            if (!line) continue;

            try {
                void this.parseMessage(line, room);

                if (line.startsWith("|init|")) {
                    const page = room!.type === "html";
                    const chat = !page && room!.type === "chat";
                    for (let n = i + 1; n < lines.length; n++) {
                        let nextLine: string = lines[n]!.trim();
                        if (page) {
                            if (nextLine.startsWith("|pagehtml|")) {
                                void this.parseMessage(nextLine, room);
                                break;
                            }
                        } else if (chat) {
                            if (nextLine.startsWith("|users|")) {
                                void this.parseMessage(nextLine.trim(), room);
                                for (let p = n + 1; p < lines.length; p++) {
                                    nextLine = lines[p]!.trim();
                                    if (nextLine.startsWith("|c:|")) continue;
                                    // prettier-ignore
                                    else if (
                                        nextLine.startsWith("|raw|<div class=\"infobox infobox-roomintro\">") &&
                                        nextLine.endsWith("</div>")
                                    ) {
                                        void this.parseMessage(nextLine, room);
                                        continue;
                                        // prettier-ignore
                                    } else if (
                                        nextLine.startsWith("|raw|<div class=\"broadcast-blue\">") &&
                                        nextLine.endsWith("</div>")
                                    ) {
                                        void this.parseMessage(nextLine, room);
                                        continue;
                                    } else if (nextLine.startsWith("|:|")) {
                                        void this.parseMessage(nextLine, room);
                                        continue;
                                    }
                                }
                            }
                            break;
                        }
                    }

                    if (page || chat) return;
                }
            } catch (e) {
                console.error(e);
            }
        }
    }

    async parseMessage(rawMessage: string, room: Room | null | undefined): Promise<void> {
        const eventName: string = rawMessage.split("|")[1] as string;
        const event: string[] = rawMessage.split("|").slice(2);
        let battleRoom = room ? global.Rooms.battles.get(room.id) : undefined;

        function isRoomNotEmp(r: Room | null | undefined): r is Room {
            return !!r && !!r.roomid && r.exists;
        }

        switch (eventName) {
            case "raw": {
                if (!isRoomNotEmp(room)) return;
                const modchatLevel = Tools.isModchatHTML(event.join("|"));
                if (modchatLevel !== false) {
                    const previousModchatLevel = room.modchat;
                    room.modchat = modchatLevel;
                    global.Rooms.set(room.roomid, room);
                    this.emit(Events.MODCHAT, room, modchatLevel, previousModchatLevel);
                }
                const modjoinLevel = Tools.isModjoinHTML(event.join("|"), room.modchat);
                if (modjoinLevel !== false) {
                    const previousModjoinLevel = room.modjoin;
                    room.modjoin = modjoinLevel;
                    global.Rooms.set(room.roomid, room);
                    this.emit(Events.MODJOIN, room, modjoinLevel, previousModjoinLevel);
                } else this.emit(Events.RAW_DATA, event.join("|"), room);
                break;
            }
            case "formats": {
                let key: string = "";
                let valueArr: string[] = [];
                let i = 1;
                for (const format of event.slice(1)) {
                    i++;
                    if (!format.startsWith("[")) {
                        if (valueArr.length) this.formats[key] = valueArr;
                        key = format;
                        valueArr = [];
                    } else valueArr.push(format.split(",")[0]!);
                    if (i === event.slice(1).length) this.formats[key] = valueArr;
                }
                break;
            }

            case "updateuser": {
                this.status.name = event[0]!.substring(1);
                this.status.id = Tools.toId(this.status.name);
                if (!event[0]!.startsWith(" Guest")) {
                    this.status.loggedIn = true;
                    this.noreplySend("|/ip");
                    if (this.options.autoJoin?.length)
                        this.options.autoJoin.forEach((r: string) => this.noreplySend("|/j " + Tools.toRoomId(r)));
                    if (this.options.avatar) this.noreplySend(`|/avatar ${this.options.avatar}`);
                    if (this.options.status) this.noreplySend(`|/status ${this.options.status}`);
                    if (!this.user)
                        this.user = new ClientUser({
                            id: this.status.id,
                            userid: this.status.id,
                            name: this.status.name,
                            rooms: false,
                            avatar: this.options.avatar,
                        });
                    if (this.status.id) await this.fetchUser(this.status.id, true);
                    if (this.user?.settings) this.user.settings = JSON.parse(event[3] as string) as UserSettings;
                    this.emit(Events.READY);
                }
                break;
            }
            case "challstr": {
                this.challstr = event.join("|");
                for (const id of ["~", "&"]) {
                    global.Users.set(
                        id,
                        new User({
                            id: id,
                            userid: id,
                            name: id,
                            rooms: false,
                            group: "&",
                            avatar: 1,
                            autoconfirmed: true,
                        })
                    );
                }

                if (!this.options.name) break;
                if (this.options.pass) this.login(this.options.name, this.options.pass);
                else this.login(this.options.name);
                break;
            }
            case "init": {
                if (!isRoomNotEmp(room)) return;
                if (room.id.startsWith("view-")) return void this.emit(Events.OPEN_HTML_PAGE, room);
                await this.fetchRoom(room.id, true);
                room.update();
                room.addUser(this.user!.name);
                if (room.type === "battle" && !global.Rooms.has(room.id)) {
                    battleRoom = new BattleRoom(room, true);
                    global.Rooms.set(room.id, battleRoom);
                }
                this.emit(Events.CLIENT_ROOM_ADD, room);

                break;
            }
            case "deinit": {
                if (!isRoomNotEmp(room)) return;
                room.removeUser(this.user!.userid);
                if (room.id.startsWith("view-")) this.emit(Events.CLOSE_HTML_PAGE, room);
                else this.emit(Events.CLIENT_ROOM_REMOVE, room);

                if (global.Rooms.has(room.id)) global.Rooms.delete(room.id);
                if (global.Rooms.has(room.id)) global.Rooms.delete(room.id);
                if (room.tourTimer) {
                    clearTimeout(room.tourTimer);
                    room.tourTimer = null;
                }
                if (room.tourSetter) {
                    clearInterval(room.tourSetter);
                    room.tourSetter = null;
                }
                if (room.visibility === "public") void room.fetch();
                break;
            }
            case "html": {
                if (this.status.loggedIn) {
                    //prettier-ignore
                    if (rawMessage.includes("<small style=\"color:gray\">(trusted)</small>")) {
                        this.trusted = true;
                        if (this.user) this.user.trusted = true;
                    }
                    this.setMessageInterval();
                }
                break;
            }

            case "title": {
                if (room) {
                    room.title = event.join("|");
                    global.Rooms.set(room.id, room);
                    if (battleRoom) {
                        battleRoom.title = event.join("|");
                        global.Rooms.set(battleRoom.id, battleRoom);
                        void this.fetchBattleRoom(room.id);
                    }
                }
                break;
            }

            case "player": {
                if (!room || room.type !== "battle") break;
                if (!battleRoom) {
                    battleRoom = new BattleRoom(room, true);
                    global.Rooms.set(battleRoom.id, battleRoom);
                }
                battleRoom.setPlayers({ [event[0]!]: this.getUser(event[1]!)! });
                battleRoom.setRating({ [event[0]!]: parseInt(event[3]!) });
                void this.fetchBattleRoom(room.id);
                global.Rooms.set(battleRoom.id, battleRoom);

                break;
            }

            case "tier": {
                if (!room || room.type !== "battle") break;
                if (!battleRoom) {
                    battleRoom = new BattleRoom(room, true);
                    global.Rooms.set(battleRoom.id, battleRoom);
                }
                void this.fetchBattleRoom(room.id);
                battleRoom.setTier(event.join("|"));
                global.Rooms.set(battleRoom.id, battleRoom);
                break;
            }

            case "turn": {
                if (!room || room.type !== "battle") break;
                if (!battleRoom) {
                    battleRoom = new BattleRoom(room, true);
                    global.Rooms.set(battleRoom.id, battleRoom);
                }
                battleRoom.turn = parseInt(event[0]!);
                global.Rooms.set(battleRoom.id, battleRoom);
                break;
            }

            case "rule": {
                if (!room || room.type !== "battle") break;
                if (!battleRoom) {
                    battleRoom = new BattleRoom(room, true);
                    global.Rooms.set(battleRoom.id, battleRoom);
                }
                battleRoom.addRule(event.join("|"));
                global.Rooms.set(battleRoom.id, battleRoom);
                break;
            }

            case "poke": {
                if (!room || room.type !== "battle") break;
                if (!battleRoom) {
                    battleRoom = new BattleRoom(room, true);
                    global.Rooms.set(battleRoom.id, battleRoom);
                }
                const name = event[1]!.split(",")[0]!,
                    gendar = (event[1]!.split(",")[1] ?? "N").trim() as "M" | "F" | "N";
                battleRoom.addPokemon(event[0] as "p1" | "p2", { name, gendar });
                global.Rooms.set(battleRoom.id, battleRoom);
                break;
            }

            case "start": {
                if (!room) break;
                battleRoom = await this.fetchBattleRoom(room.id);
                this.emit(Events.BATTLE_START, battleRoom);
                break;
            }

            case "win":
            case "tie": {
                if (!room) break;
                battleRoom = await this.fetchBattleRoom(room.id);
                let winner: User | undefined = undefined;
                if (eventName === "win") winner = await this.fetchUser(event.join("|"));
                this.emit(Events.BATTLE_END, battleRoom, eventName, winner);
                break;
            }

            case "queryresponse": {
                switch (event[0]) {
                    case "roominfo": {
                        let roominfo: RoomOptions | undefined = undefined;
                        try {
                            roominfo = JSON.parse(event.slice(1).join("|")) as RoomOptions;
                        } catch (e: unknown) {
                            console.error(`Error in parsing roominfo: ${(e as SyntaxError).message}`);
                        }
                        if (!roominfo || !roominfo.id) return;
                        global.Rooms.raw.set(roominfo.id, roominfo);
                        if (roominfo.users) {
                            roominfo.users
                                .filter((u): boolean => {
                                    const user = global.Users.get(Tools.toId(u));
                                    if (!user || Date.now() - user.lastFetchTime >= 15 * 1000) return true;
                                    return false;
                                })
                                .forEach((u) => this.noreplySend(`|/cmd userdetails ${Tools.toId(u)}`));
                        }

                        const PendingRoom: PromisedRoom[] = this.roominfoQueue.filter((r) => r.id === roominfo!.id);
                        if (!PendingRoom.length) return;
                        if (roominfo.error) {
                            if (roominfo.id.startsWith("view-")) {
                                delete roominfo.error;
                                roominfo = {
                                    id: roominfo.id,
                                    roomid: roominfo.id,
                                    type: "html",
                                };
                            } else {
                                roominfo.type = "chat";
                                PendingRoom.forEach((e) => e.reject(roominfo!));
                            }

                            break;
                        }
                        if (roominfo.id.startsWith("battle-")) {
                            this.addBattleRoom(roominfo);
                        }

                        PendingRoom.forEach((e) => e.resolve(this.addRoom(roominfo)));
                        break;
                    }
                    case "userdetails": {
                        let userdetails: UserOptions | undefined = undefined;
                        try {
                            userdetails = JSON.parse(event.slice(1).join("|")) as UserOptions;
                        } catch (e: unknown) {
                            console.error(`Error in parsing userdetails: ${(e as SyntaxError).message}`);
                        }
                        if (!userdetails || !userdetails.userid) return;
                        global.Users.raw.set(userdetails.id, userdetails);
                        if (userdetails.id === this.status.id) {
                            this.addUser(userdetails);
                            if (this.user) {
                                this.user.update();
                                for (const [k, v] of Object.entries(userdetails)) {
                                    if (k === "rooms") {
                                        this.user.rooms.clear();
                                        for (const r of Object.keys(userdetails.rooms).map((r) =>
                                            Tools.toRoomId(r.replace(/^[^a-z0-9]/i, ""))
                                        )) {
                                            const room = global.Rooms.get(r);
                                            if (!room || !room.exists) continue;
                                            this.user.rooms.set(room.roomid, room);
                                        }
                                    } else if (k !== "client") {
                                        // @ts-expect-error props should exists in ClientUser
                                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                                        if (k in this.user) this.user[k as keyof ClientUser] = v as valueof<ClientUser>;
                                    }
                                }
                            } else this.user = new ClientUser(userdetails);
                            this.user.online = true;
                            this.setMessageInterval();
                        }
                        const user = this.addUser(userdetails);
                        if (!user) break;
                        const PendingUser: PromisedUser[] = this.userdetailsQueue.filter((u) => u.id === userdetails.id);
                        if (!PendingUser.length) break;
                        PendingUser.forEach((e) => e.resolve(user));
                        break;
                    }
                    case "roomlist": {
                        const rooms = JSON.parse(event.slice(1).join("|")) as { rooms: Dict<IBattleRoom> };
                        this.emit(Events.BATTLE_LIST, rooms.rooms);
                        break;
                    }
                }
                this.emit(Events.QUERY_RESPONSE, event.slice(1).join("|"));
                break;
            }

            case "chat":
            case "c": {
                if (!isRoomNotEmp(room)) return;
                if (!event[0]) break;
                room = global.Rooms.get(room.id) ?? room;
                const content = event.slice(1).join("|");
                if (content.startsWith("/log")) {
                    const logDetails = Tools.getLogDetails(content);
                    if (logDetails.staff) event[0] = logDetails.staff;
                    if (logDetails.room && logDetails.editRoom) room = await this.fetchRoom(room.id).catch(() => this.getRoom(room!.id)!);
                    if (logDetails.isPunish || logDetails.action === "promote" || logDetails.action === "demote")
                        void (await this.fetchUser(logDetails.target));
                }
                const author = this.getUser(event[0]) ?? (await this.fetchUser(event[0]));
                const message = new Message<Room>({
                    author: author,
                    content: content,
                    type: "Room",
                    target: room,
                    raw: rawMessage,
                    time: Date.now(),
                    client: this,
                } as MessageInput<Room>);
                if (this.PromisedChat.length && this.user) {
                    for (let i = 0; i < this.PromisedChat.length; i++) {
                        const element = this.PromisedChat[i]!;
                        if (element.id === message.target.roomid && this.user.userid === message.author.userid) {
                            element.received = true;
                            this.PromisedChat.splice(i, 1);
                            break;
                        }
                    }
                }
                this.emit(Events.MESSAGE_CREATE, message);
                break;
            }

            case "c:": {
                if (!isRoomNotEmp(room)) return;
                room = global.Rooms.get(room.id);
                if (!isRoomNotEmp(room)) return;
                const content = event.slice(2).join("|");
                if (content.startsWith("/log")) {
                    const logDetails = Tools.getLogDetails(content);
                    if (logDetails.staff) event[1] = logDetails.staff;
                    if (logDetails.room && logDetails.editRoom) room = await this.fetchRoom(room.id).catch(() => this.getRoom(room!.id)!);
                    if (logDetails.isPunish || logDetails.action === "promote" || logDetails.action === "demote")
                        void (await this.fetchUser(logDetails.target));
                }
                const by = this.getUser(event[1]!) ?? (await this.fetchUser(event[1]!)),
                    message = new Message<Room>({
                        author: by,
                        content,
                        type: "Room",
                        target: room,
                        raw: rawMessage,
                        client: this,
                        time: parseInt(event[0] as string),
                    } as MessageInput<Room>);
                if (this.PromisedChat.length && this.user) {
                    for (let i = 0; i < this.PromisedChat.length; i++) {
                        const element = this.PromisedChat[i]!;
                        if (element.id === message.target.roomid && this.user.userid === message.author.userid) {
                            element.received = true;
                            this.PromisedChat.splice(i, 1);
                            break;
                        }
                    }
                }
                this.emit(Events.MESSAGE_CREATE, message);
                if (this.options.prefix && content.startsWith(this.options.prefix)) this.emit(Events.COMMAND_EMIT);
                break;
            }

            case "pm": {
                if (!event[0] || !event[1] || !Tools.toId(event[0]) || !Tools.toId(event[1])) {
                    const value = event.slice(2).join("|");
                    if (!this.trusted && value.startsWith("/raw ") && this.status.loggedIn) {
                        //prettier-ignore
                        if (value.includes("<small style=\"color:gray\">(trusted)</small>")) this.trusted = true;
                        else this.trusted = false;
                        if (this.user) this.user.trusted = this.trusted;

                        this.setMessageInterval();
                    }
                    break;
                }
                const authorName = Tools.toId(event[0]),
                    receiverName = Tools.toId(event[1]);
                let author: User, sendTo: User;
                if (this.user?.userid) {
                    if (authorName === this.user.userid) author = this.user;
                    else author = await this.fetchUser(authorName, true);
                    if (receiverName === this.user.userid) sendTo = this.user;
                    else sendTo = await this.fetchUser(receiverName, true);
                } else {
                    author = await this.fetchUser(authorName, true);
                    sendTo = await this.fetchUser(receiverName, true);
                }
                const value = event.slice(2).join("|");
                const message = new Message<User>({
                    author: author,
                    content: value,
                    type: "PM",
                    target: sendTo,
                    raw: rawMessage,
                    client: this,
                    time: Date.now(),
                } as MessageInput<User>);
                this.emit(Events.MESSAGE_CREATE, message);
                if (this.options.prefix && value.startsWith(this.options.prefix)) this.emit(Events.COMMAND_EMIT);

                if (!this.user || !this.PromisedPM.length) break;
                for (let i = 0; i < this.PromisedPM.length; i++) {
                    const element = this.PromisedPM[i]!;
                    if (element.id === message.target.userid && this.user.userid === message.author.userid) {
                        element.received = true;
                        this.PromisedPM.splice(i, 1);
                        break;
                    }
                }
                break;
            }

            case "j":
            case "J":
            case "join": {
                if (!isRoomNotEmp(room)) return;
                void this.fetchRoom(room.id);
                const name = event.join("|"),
                    user = await this.fetchUser(name);
                user.addRoom(room.id);
                room.update().addUser(name);
                this.emit(Events.ROOM_USER_ADD, room, user);
                break;
            }

            case "l":
            case "L":
            case "leave": {
                if (!isRoomNotEmp(room)) return;
                void this.fetchRoom(room.id);
                const id = Tools.toId(event.join("|"));
                room.update().removeUser(id);
                const user = this.getUser(id) ?? new User({ id, userid: id, name: event.join("|"), rooms: false });
                const fetchedUser = await user.fetch();
                fetchedUser.setIsOnline();
                user.removeRoom(room.id);
                this.emit(Events.ROOM_USER_REMOVE, room, user);
                if (!fetchedUser.rooms.size) {
                    global.Users.delete(fetchedUser.id);
                    if (user.alts.length) user.alts.forEach((u) => global.Users.delete(u));
                }
                break;
            }

            case "n":
            case "N":
            case "name": {
                if (room) void this.fetchRoom(room.id);
                const previousName = Tools.toId(event[1] as string);
                const renameFrom = this.getUser(previousName);
                const renameTo = new User({
                    id: Tools.toId(event[0]!),
                    userid: Tools.toId(event[0]!),
                    name: event[0]!,
                    rooms: renameFrom?.rooms ? Tools.clone(renameFrom.rooms) : false,
                    avatar: renameFrom?.avatar ?? undefined,
                    guestNumber: renameFrom?.guestNumber,
                    alts: renameFrom?.alts ? Tools.clone(renameFrom.alts) : [],
                });

                void (await renameTo.fetch());
                global.Users.set(renameTo.userid, renameTo);
                if (renameFrom) {
                    renameFrom.addAlt(renameTo.userid);
                    if (room) renameFrom.removeRoom(room.roomid);
                    global.Users.set(renameFrom.id, renameFrom);
                    renameTo.addAlt(renameFrom.userid);
                }
                global.Users.set(renameTo.userid, renameTo);
                this.emit(Events.USER_RENAME, renameTo, renameFrom!);
                if (room) {
                    room.update().removeUser(previousName);
                    room.addUser(renameTo.userid);
                    if (room.tour) {
                        const renamed = room.tour.renamePlayer(previousName, renameTo.name);
                        if (!renamed && !global.Users.raw.has(renameTo.id)) {
                            void this.fetchUser(renameTo.id).then(() => room!.tour!.renamePlayer(previousName, renameTo.name));
                        }
                    }
                }
                break;
            }

            case "error": {
                const error = event.join("|");
                this.emit(Events.CHAT_ERROR, error, room?.update() ?? null);
                break;
            }

            case "tournament": {
                if (!isRoomNotEmp(room)) return;
                const cachedRoom = global.Rooms.get(room.id);
                if (!isRoomNotEmp(cachedRoom)) {
                    room = await this.fetchRoom(room.id);
                } else room = cachedRoom;
                const tourEventName = event[0]!;
                const tourEvent = event.slice(1);
                switch (tourEventName) {
                    case "create": {
                        const format = tourEvent[0]!,
                            type = tourEvent[1]!;
                        let playerCap: number = parseInt(tourEvent[2] ?? "");
                        if (!playerCap || Number.isNaN(playerCap)) playerCap = 0;
                        const isElim = type.endsWith("Elimination");
                        let tour: Tournament<EliminationBracket | RoundRobinBracket>;
                        if (isElim) tour = new Tournament<EliminationBracket>(format, type, playerCap ?? 0, room);
                        else tour = new Tournament<RoundRobinBracket>(format, type, playerCap ?? 0, room);
                        room.tour = tour;
                        global.Rooms.set(room.id, room);

                        this.emit(Events.TOUR_CREATE, room, format, type, playerCap);
                        break;
                    }

                    case "update": {
                        const data: TourUpdateData = JSON.parse(tourEvent[0]!) as TourUpdateData;
                        if (room.tour) room.tour.update(data);

                        this.emit(Events.TOUR_UPDATE, room, data);
                        break;
                    }

                    case "updateEnd": {
                        this.emit(Events.TOUR_UPDATE_END, room);
                        break;
                    }

                    case "start": {
                        const numPlayers = parseInt(tourEvent[0]!);
                        if (room.tour) room.tour.onStart();
                        this.emit(Events.TOUR_START, room, numPlayers);
                        break;
                    }

                    case "join": {
                        const user: string = tourEvent.join("|");
                        if (room.tour) {
                            const player = room.tour.addPlayer(user);
                            if (!player) {
                                void (await this.fetchUser(user).then(() => room!.tour!.addPlayer(user)!));
                            }
                        }
                        this.emit(Events.TOUR_JOIN, room, this.getUser(user)!);
                        break;
                    }

                    case "leave":
                    case "disqualify": {
                        const user: string = tourEvent.join("|");
                        if (room.tour) room.tour.removePlayer(user);
                        this.emit(Events.TOUR_LEAVE, room, this.getUser(user));
                        break;
                    }

                    case "replace": {
                        const user1 = tourEvent[0]!,
                            user2 = tourEvent[1]!;
                        if (room.tour) {
                            const newPlayer = room.tour.renamePlayer(user1, user2);
                            if (!newPlayer) {
                                if (!global.Users.raw.has(user1)) void (await this.fetchUser(user1));
                                if (!global.Users.raw.has(user2)) void (await this.fetchUser(user2));
                                room.tour.renamePlayer(user1, user2);
                            }
                        }
                        this.emit(Events.TOUR_REPLACE, room, this.getUser(user1), this.getUser(user2));
                        break;
                    }

                    case "battlestart": {
                        const user1 = tourEvent[0]!,
                            user2 = tourEvent[1]!,
                            battleRoom = tourEvent[2]!;
                        this.emit(Events.TOUR_BATTLE_START, room, this.getUser(user1)!, this.getUser(user2)!, battleRoom);
                        break;
                    }

                    case "battleend": {
                        const user1 = tourEvent[0]!,
                            user2 = tourEvent[1]!,
                            result = tourEvent[2] as "win" | "loss" | "draw",
                            rawScore = tourEvent[3] as string,
                            recorded = tourEvent[4] as "success" | "fail",
                            battleRoom = tourEvent[2]!;
                        const score = rawScore.split(",").map((e) => parseInt(Tools.toId(e))) as [number, number];

                        if (room.tour) {
                            if (result === "win") {
                                room.tour.removePoints(user2, 1);
                                if (room.tour.isElim() && room.tour.players.get(Tools.toId(user2))?.score === -1 * room.tour.round.number)
                                    room.tour.eliminatePlayer(user2);
                            } else if (result === "loss") {
                                room.tour.removePoints(user1, 1);
                                if (room.tour.isElim() && room.tour.players.get(Tools.toId(user2))?.score === -1 * room.tour.round.number)
                                    room.tour.eliminatePlayer(user1);
                            }
                        }

                        this.emit(
                            Events.TOUR_BATTLE_END,
                            room,
                            this.getUser(user1)!,
                            this.getUser(user2)!,
                            result,
                            score,
                            recorded,
                            battleRoom
                        );
                        break;
                    }

                    case "end": {
                        const data: TourEndData = JSON.parse(tourEvent[0]!) as TourEndData;
                        room.update();
                        if (room.tour) {
                            room.tour.update(data);
                            room.tour.onEnd(false);
                        }
                        this.emit(Events.TOUR_END, room, data, false);
                        room.tour = null;
                        break;
                    }

                    case "forceend": {
                        if (room.tour) room.tour.onEnd(true);
                        this.emit(Events.TOUR_END, room, null, true);
                        room.tour = null;
                        break;
                    }
                }
                break;
            }

            default:
                this.emit(eventName, event);
        }
    }

    fetchUser(userid: string, useCache?: boolean): Promise<User> {
        const client = this;
        return new Promise((resolve) => {
            if (userid.length === 1 && ["&", "~"].includes(userid)) return resolve(client.getUser("&")!);

            userid = Tools.toId(userid);
            const previousUser = client.getUser(userid);
            if (previousUser && Date.now() - previousUser.lastFetchTime < USER_FETCH_COOLDOWN) return resolve(previousUser);

            const time = Date.now().toString();
            const user = {
                id: userid,
                time: time,
                resolve: (user: User) => {
                    resolve(user);
                    client.userdetailsQueue = client.userdetailsQueue.filter((e) => e.id !== userid && e.time !== time);
                },
            };

            client.noreplySend(`|/cmd userdetails ${userid}`);
            client.userdetailsQueue.push(user);
            if (useCache) {
                const u: User = new User({
                    id: userid,
                    userid: userid,
                    name: userid,
                    rooms: false,
                });
                setTimeout(user.resolve.bind(client), 8 * 1000, global.Users.get(userid) ?? u);
            }
        });
    }

    getUser(id: string): User | undefined {
        id = Tools.toId(id);
        if (global.Users.has(id)) return global.Users.get(id) as User;
        const users: User[] = [...global.Users.values()];
        for (const user of users) {
            if (user.alts.some((u) => u === id)) return user;
        }
        return;
    }

    addUser(input: UserOptions, fetched?: boolean): User | null {
        if (typeof input !== "object" || !input.userid) return null;
        if (!input.alts) input.alts = [];
        let user: User | undefined = global.Users.get(input.userid);
        if (user && user.status && !input.status) user.status = "";
        if (input.userid.startsWith("guest")) {
            input.guestNumber = input.userid.replace("guest", "");
            input.userid = input.id;
            input.alts = [input.userid];
            if (input.name.startsWith("Guest ")) input.name = input.id;
        } else if (input.id !== input.userid) {
            if (!user || !user.alts.includes(input.userid)) input.alts = [input.userid];
            if (!global.Users.has(input.userid)) {
                const origin = global.Users.get(input.id);
                if (origin) {
                    global.Users.set(
                        input.userid,
                        Object.assign(origin, {
                            id: input.userid,
                            userid: input.userid,
                            name: input.userid,
                            alts: [input.id],
                        })
                    );
                } else {
                    global.Users.set(
                        input.userid,
                        new User(
                            Object.assign(input, {
                                id: input.userid,
                                userid: input.userid,
                                name: input.userid,
                                alts: [input.id],
                            })
                        )
                    );
                }
                void global.Users.fetch(input.userid);
            } else {
                const altUser = global.Users.get(input.userid)!;
                if (!altUser.alts.includes(input.id)) altUser.alts.push(input.id);
                global.Users.set(altUser.id, altUser);
            }
        }
        if (!user) {
            user = new User(input);
            void this.fetchUser(input.userid, false);
        } else {
            if (user.alts.length && input.alts?.length) {
                for (const id of input.alts) {
                    if (!user.alts.includes(id)) {
                        user.alts.push(id);
                    }
                }
            }
            for (const [k, v] of Object.entries(input)) {
                if (k === "rooms" || k === "client") continue;
                // @ts-expect-error props exists in user
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                if (k in user) user[k as keyof typeof user] = v as valueof<typeof user>;
            }
        }
        if (input.rooms) {
            user.rooms.clear();
            const rooms = Object.keys(input.rooms).map((r) => r.replace(/^[^a-z0-9]/i, ""));
            for (const id of rooms) {
                const room = this.getRoom(id);
                if (!room) continue;
                user.rooms.set(room.roomid, room);
            }
        }
        if (fetched !== false) user.setLastFetchTime();
        user.setIsOnline();
        global.Users.set(user.userid, user);
        return user;
    }

    fetchRoom(roomid: string, force?: boolean): Promise<Room> {
        roomid = Tools.toRoomId(roomid);
        const client = this;
        const time = Date.now().toString();
        return new Promise((resolve, reject) => {
            const r: PromisedRoom = {
                id: roomid,
                time: time,
                resolve: (room: Room) => {
                    resolve(room);
                    client.roominfoQueue = client.roominfoQueue.filter((e) => e.id !== roomid && e.time !== time);
                },
                reject: function (room: TimeoutError | RoomOptions) {
                    if (!client.roominfoQueue.includes(this)) return;
                    if (room instanceof TimeoutError) reject(room);
                    else if (room.error) {
                        if (room.error === "timeout") {
                            if (force) setTimeout(() => void client.fetchRoom(roomid, true), 5 * 1000);
                            else reject(new TimeoutError(`fetchRoom(roomid: ${roomid})`));
                        } else reject(new AccessError(`fetchRoom(roomid: ${roomid})`, room.error));
                    } else if (global.Rooms.has(roomid)) resolve(global.Rooms.get(roomid)!);

                    client.roominfoQueue = client.roominfoQueue.filter((e) => e.id !== roomid && e.time !== time);
                },
            };
            client.roominfoQueue.push(r);
            client.noreplySend(`|/cmd roominfo ${roomid}`);
            if (client.ws && !!client.ws.readyState)
                setTimeout(r.reject, 5 * 1000, {
                    id: roomid,
                    error: "timeout",
                });
        });
    }

    getRoom(roomid: string): Room | undefined {
        roomid = Tools.toRoomId(roomid);
        return global.Rooms.get(roomid);
    }

    addRoom(input: RoomOptions, fetched?: boolean): Room {
        if (typeof input !== "object" || !input.roomid) throw new PSAPIError("EMPTY", "Room");

        let room: Room | undefined = global.Rooms.get(input.roomid);
        if (!room) {
            room = new Room(input);
            this.noreplySend(`|/cmd roominfo ${input.id}`);
        } else {
            for (const [k, v] of Object.entries(input)) {
                if (k === "client" || k === "error") continue;
                // @ts-expect-error props exists in room
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                if (k in room) room[k as keyof typeof room] = v as valueof<typeof room>;
            }
        }
        if (input.users) {
            room.userCollection.clear();
            for (const id of input.users) {
                const user = this.getUser(id);
                if (!user) continue;
                room.userCollection.set(user.userid, user);
            }
        }
        room.setVisibility();
        if (fetched !== false) room.setLastFetchTime();
        global.Rooms.set(room.roomid, room);
        return room;
    }

    fetchBattleList(param: string): void {
        return this.noreplySend(`|/cmd roomlist ${param}`);
    }

    fetchBattleRoom(roomid: string, force?: boolean): Promise<BattleRoom> {
        return this.fetchRoom(roomid, !!force).then((room) => {
            const battleRoom = global.Rooms.battles.get(room.id)!;
            global.Rooms.set(battleRoom.roomid, battleRoom);
            return battleRoom;
        });
    }

    addBattleRoom(input: RoomOptions, fetched?: boolean): BattleRoom {
        if (typeof input !== "object" || !input.roomid) throw new PSAPIError("EMPTY", "BattleRoom");

        let room: BattleRoom | undefined = global.Rooms.battles.get(input.roomid);
        if (!room) {
            room = new BattleRoom(input);
            this.noreplySend(`|/cmd roominfo ${input.id}`);
        } else {
            for (const [k, v] of Object.entries(input)) {
                if (k === "client" || k === "error") continue;
                // @ts-expect-error props exists in room
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                if (k in room) room[k as keyof typeof room] = v as valueof<typeof room>;
            }
        }
        if (input.users) {
            for (const id of input.users) {
                const user = this.getUser(id);
                if (!user) continue;
                room.userCollection.set(user.userid, user);
            }
        }
        room.visibility = "public";
        room.setUsers();
        if (fetched !== false) room.setLastFetchTime();
        global.Rooms.set(room.roomid, room);
        return room;
    }
}

export const initializeGlobalClient = () => {
    global.BotClient.ps = new Client(Config.PSOptions);
};
