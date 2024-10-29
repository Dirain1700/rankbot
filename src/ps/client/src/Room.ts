"use strict";

import { Collection } from "@discordjs/collection";

import { cloneDeep } from "lodash";

import { PSAPIError } from "./Error";
import { Tools } from "./Tools";
import { User } from "./User";

import type { Client } from "./Client";
import type { Message } from "./Message";
import type { Tournament } from "./Tour";
import type { Dict } from "../types";

import type { IRoomOutGoingMessageOptions } from "../types/Client";
import type { MessageWaits, awaitMessageOptions } from "../types/Message";
import type { RoomOptions, RoomPermissions, ModchatLevel, IBattlePokemonType } from "../types/Room";
import type { GroupSymbol, GroupNames } from "../types/UserGroups";

/* eslint-disable @typescript-eslint/no-non-null-assertion */

export class Room {
    id: string;
    roomid: string;
    title: string;
    type: "chat" | "battle" | "html";
    visibility: "public" | "hidden" | "secret";
    modchat: ModchatLevel;
    modjoin: ModchatLevel;
    tourTimer: NodeJS.Timeout | null = null;
    tourSetter: NodeJS.Timeout | null = null;
    tour: Tournament | null = null;
    auth: {
        // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
        [key: GroupSymbol | string]: string[];
    };
    userCollection: Collection<string, User>;
    users: string[];
    lastFetchTime: number = 0;
    waits: MessageWaits<Room>[];
    readonly exists: boolean;

    constructor(init: RoomOptions, noinit?: boolean) {
        this.id = init.id;
        this.roomid = init.roomid || init.id;
        this.title = init.title || init.id;
        this.type = init.id?.startsWith("view-") ? "html" : init.type;
        this.visibility = init.visibility || "secret";
        this.modchat = init.modchat || null;
        this.modjoin = init.modjoin || null;
        this.auth = init.auth || {};
        this.userCollection = new Collection();
        this.users = init.users || [];
        this.waits = init.waits ?? [];
        this.exists = init.error ? false : true;
        Object.defineProperty(this, "waits", {
            enumerable: false,
            writable: true,
        });
        Object.defineProperty(this, "client", {
            enumerable: false,
            writable: true,
        });
        this.setVisibility();
        this.setUsers();
        if (!this.title && !this.userCollection.size && !noinit) this.update();
    }

    setVisibility(): void {
        if (this.visibility !== "secret") return;
        const users: [string, GroupSymbol][] = this.users.map((u) => [Tools.toId(u), u.charAt(0) as GroupSymbol]);
        if (users.some(([u, a]) => !Tools.isHigherRank(this.getRoomRank(u), a))) this.visibility = "hidden";
    }

    send(content: string, options?: Partial<IRoomOutGoingMessageOptions>): void {
        if (!this.exists || !this.roomid) throw new PSAPIError("ROOM_NONEXIST", this.id);
        if (!content) throw new PSAPIError("EMPTY_MESSAGE");

        const outgoingMessage: IRoomOutGoingMessageOptions = {
            roomid: this.roomid,
            text: this.setupMessage(content),
            raw: content,
            type: options && options.type ? options.type : undefined,
            measure: options && options.measure ? options.measure : undefined,
        };

        PS.send(outgoingMessage);
    }

    setupMessage(content: string): string {
        if (!this.exists || !this.roomid) throw new PSAPIError("ROOM_NONEXIST", this.id);
        return this.roomid + "|" + content;
    }

    setLastFetchTime(time?: number): void {
        if (time && time > Date.now()) return;
        this.lastFetchTime = time ?? Date.now();
    }

    update(): this {
        this.setUsers();
        const room = global.Rooms.get(this.id);
        if (!room) return this;
        Object.assign(this, room);
        return this;
    }

    setUsers(): this {
        for (const u of this.users) {
            void Users.fetch(u);
            const previousUser = this.userCollection.get(Tools.toId(u));
            if (previousUser) {
                this.userCollection.set(previousUser.userid, previousUser.update());
                continue;
            }
            const user = Users.get(u);
            if (!user) continue;
            this.userCollection.set(user.userid, user);
        }
        return this;
    }

    addUser(name: string): this {
        const userid = Tools.toId(name);
        if (!userid) return this;
        const user = Users.get(userid);
        if (!user) return this;
        const nameIndex = this.users.map((u) => Tools.toId(u)).indexOf(userid);
        if (nameIndex !== -1) {
            this.users.splice(nameIndex, 1);
        }
        this.users.push(user.group + user.name);
        this.userCollection.set(user.userid, user);
        return this;
    }

    removeUser(userid: string): this {
        userid = Tools.toId(userid);
        if (userid) {
            const nameIndex = this.users.map((u) => Tools.toId(u)).indexOf(userid);
            if (nameIndex === -1) return this;
            this.users.splice(nameIndex, 1);
        }
        if (this.userCollection.has(userid)) this.userCollection.delete(userid);
        return this;
    }

    fetch(force?: boolean): Promise<Room> {
        return global.Rooms.fetch(this.roomid, !!force);
    }

    announce(text: string): void {
        if (!PS.user) throw new PSAPIError("NOT_LOGGED_IN");
        this.checkCan("warn", PS.user, true);
        this.send("/announce " + text, { type: "command", measure: false });
    }

    setModchat(rank: GroupSymbol): void {
        if (!PS.user) throw new PSAPIError("NOT_LOGGED_IN");
        if (Tools.isHigherRank(rank, "%")) this.checkCan("roomban", PS.user, true);
        else this.checkCan("warn", PS.user, false);
        this.send("/modchat " + rank, { type: "command", measure: false });
    }

    setAnnounce(content?: string | null): void {
        if (!PS.user) throw new PSAPIError("NOT_LOGGED_IN");
        this.checkCan("announcement", PS.user, true);
        if (content) this.send("/announcement create " + content);
        else this.send("/announcement end", { type: "command", measure: false });
    }

    sendUhtml(id: string, html: string, change?: boolean): void {
        if (!PS.user) throw new PSAPIError("NOT_LOGGED_IN");
        this.checkCan("html", PS.user, true);
        if (change) this.changeUhtml(id, html);
        if (!id || !html) throw new PSAPIError("EMPTY", !id ? "ID" : "HTML");
        this.send(`/adduhtml ${id},${html}`, { type: "command", measure: false });
    }

    changeUhtml(id: string, html: string): void {
        if (!PS.user) throw new PSAPIError("NOT_LOGGED_IN");
        this.checkCan("html", PS.user, true);
        if (!id || !html) throw new PSAPIError("EMPTY", !id ? "ID" : "HTML");
        this.send(`/changeuhtml ${id},${html}`, { type: "command", measure: false });
    }

    clearUhtml(id: string): void {
        if (!PS.user) throw new PSAPIError("NOT_LOGGED_IN");
        this.checkCan("html", PS.user, true);
        if (!id) throw new PSAPIError("EMPTY", "ID");
        this.send(`/changeuhtml ${id},<div></div>`, { type: "command", measure: false });
    }

    sendHtmlBox(html: string): void {
        if (!PS.user) throw new PSAPIError("NOT_LOGGED_IN");
        this.checkCan("html", PS.user, true);
        if (!html) throw new PSAPIError("EMPTY", "HTML");
        this.send(`/addhtmlbox ${html}`, { type: "command", measure: false });
    }

    sendAuthUhtml(rank: GroupSymbol, id: string, html: string, change?: boolean): void {
        if (!PS.user) throw new PSAPIError("NOT_LOGGED_IN");
        this.checkCan("html", PS.user, true);
        if (change) this.changeAuthUhtml(rank, id, html);
        if (!id || !html) throw new PSAPIError("EMPTY", !id ? "ID" : "HTML");
        this.send(`/addrankuhtml ${rank},${id},${html}`, { type: "command", measure: false });
    }

    changeAuthUhtml(rank: GroupSymbol, id: string, html: string): void {
        if (!PS.user) throw new PSAPIError("NOT_LOGGED_IN");
        this.checkCan("html", PS.user, true);
        if (!id || !html) throw new PSAPIError("EMPTY", !id ? "ID" : "HTML");
        this.send(`/changerankuhtml ${rank},${id},${html}`, { type: "command", measure: false });
    }

    clearAuthUhtml(rank: GroupSymbol, id: string): void {
        if (!PS.user) throw new PSAPIError("NOT_LOGGED_IN");
        this.checkCan("html", PS.user, true);
        if (!id) throw new PSAPIError("EMPTY", "ID");
        this.send(`/changeuhtml ${rank},${id},<div></div>`, { type: "command", measure: false });
    }

    sendAuthHtmlBox(rank: GroupSymbol, html: string): void {
        if (!PS.user) throw new PSAPIError("NOT_LOGGED_IN");
        this.checkCan("html", PS.user, true);
        if (!html) throw new PSAPIError("EMPTY", "HTML");
        this.send(`/addrankhtmlbox ${rank},${html}`, { type: "command", measure: false });
    }

    sendPrivateUhtml(user: string, id: string, html: string, change?: boolean): void {
        if (!PS.user) throw new PSAPIError("NOT_LOGGED_IN");
        this.checkCan("html", PS.user, true);
        if (change) return this.changePrivateUhtml(user, id, html);
        user = Tools.toId(user);
        if (!user || !id || !html) throw new PSAPIError("EMPTY", !user ? "User" : !id ? "ID" : "HTML");
        this.send(`/sendprivateuhtml ${user},${id},${html}`, { type: "command", measure: false });
    }

    changePrivateUhtml(user: string, id: string, html: string): void {
        if (!PS.user) throw new PSAPIError("NOT_LOGGED_IN");
        this.checkCan("html", PS.user, true);
        user = Tools.toId(user);
        if (!user || !html || !id) throw new PSAPIError("EMPTY", !user ? "User" : !id ? "uhtml ID" : "HTML");
        this.send(`/changeprivateuhtml ${user},${id},${html}`, { type: "command", measure: false });
    }

    clearPrivateUhtml(user: string, id: string): void {
        if (!PS.user) throw new PSAPIError("NOT_LOGGED_IN");
        this.checkCan("html", PS.user, true);
        user = Tools.toId(user);
        if (!user || !id) throw new PSAPIError("EMPTY", !user ? "User" : "ID");
        this.send(`/changeprivateuhtml ${user},${id},<div></div>`, { type: "command", measure: false });
    }

    sendPrivateHtmlBox(user: string, html: string): void {
        if (!PS.user) throw new PSAPIError("NOT_LOGGED_IN");
        this.checkCan("html", PS.user, true);
        user = Tools.toId(user);
        if (!user || !html) throw new PSAPIError("EMPTY", !user ? "User" : "HTML");
        this.send(`/sendprivatehtmlbox ${user},${html}`, { type: "command", measure: false });
    }

    sendPmUhtml(user: string, id: string, html: string, change?: boolean): void {
        if (!PS.user) throw new PSAPIError("NOT_LOGGED_IN");
        this.checkCan("html", PS.user, true);
        if (change) return this.changePmUhtml(user, id, html);
        user = Tools.toId(user);
        if (!user || !id || !html) throw new PSAPIError("EMPTY", !user ? "User" : !id ? "ID" : "HTML");
        this.send(`/pmuhtml ${user},${id},${html}`, { type: "command", measure: false });
    }

    changePmUhtml(user: string, id: string, html: string): void {
        if (!PS.user) throw new PSAPIError("NOT_LOGGED_IN");
        this.checkCan("html", PS.user, true);
        user = Tools.toId(user);
        if (!user || !id || !html) throw new PSAPIError("EMPTY", !user ? "User" : !id ? "ID" : "HTML");
        this.send(`/pmuhtmlchange ${user},${id},${html}`, { type: "command", measure: false });
    }

    clearPmUhtml(user: string, id: string): void {
        if (!PS.user) throw new PSAPIError("NOT_LOGGED_IN");
        this.checkCan("html", PS.user, true);
        user = Tools.toId(user);
        if (!user || !id) throw new PSAPIError("EMPTY", !user ? "User" : "ID");
        this.send(`/pmuhtmlchange ${user},${id},<div></div>`, { type: "command", measure: false });
    }

    sendPmHtmlBox(user: string, html: string): void {
        if (!PS.user) throw new PSAPIError("NOT_LOGGED_IN");
        this.checkCan("html", PS.user, true);
        user = Tools.toId(user);
        if (!user || !html) throw new PSAPIError("EMPTY", !user ? "User" : "ID");
        this.send(`/pminfobox ${user},${html}`, { type: "command", measure: false });
    }

    sendHtmlPage(user: string, id: string, html: string): void {
        if (!PS.user) throw new PSAPIError("NOT_LOGGED_IN");
        this.checkCan("html", PS.user, true);
        user = Tools.toId(user);
        if (!user || !id || !html) throw new PSAPIError("EMPTY", !user ? "User" : !id ? "ID" : "HTML");
        this.send(`/sendhtmlpage ${user},${id},${html}`, { type: "command", measure: false });
    }

    modnote(text: string): void {
        if (!PS.user) throw new PSAPIError("NOT_LOGGED_IN");
        this.checkCan("warn", PS.user);
        this.send("/modnote " + text, { type: "command", measure: false });
    }

    hidetext(user: string, clear: boolean, lines?: number | null, alts?: false, reason?: string): Promise<Message<Room> | null>;
    hidetext(user: string, clear: boolean, lines: null, alts: true, reason?: string): Promise<Message<Room> | null>;
    hidetext(user: string, clear: boolean, lines?: number | null, alts?: boolean, reason?: string): Promise<Message<Room> | null> {
        if (!PS.user) throw new PSAPIError("NOT_LOGGED_IN");
        if (lines && alts) throw new PSAPIError("INVALID_ARGUMENT", "alts and lines can't be specified at the same time");
        this.checkCan("hidetext", PS.user);
        const r = this;
        return new Promise((resolve, reject) => {
            r.send(
                `/${clear ? "clear" : "hide"}${lines ? "lines" : alts ? "altstext" : "text"} ${user},${lines ? lines + "," : ""}${
                    reason || ""
                }`,
                {
                    type: "command",
                    measure: false,
                }
            );
            r.awaitMessages({
                filter: (m: Message<Room>) =>
                    m.author.id === PS.user!.id && m.content.endsWith(`by ${PS.user!.name}.${reason ? " (" + reason + ")" : ""}`),
                max: 1,
                time: 10 * 1000,
            })
                .then((m: Message<Room>[] | null) => resolve((m as Message<Room>[])[0]!))
                .catch(reject);
        });
    }

    warn(targetUser: User, reason?: string): void {
        if (!targetUser.online) return;
        if (!PS.user) throw new PSAPIError("NOT_LOGGED_IN");
        this.checkCan("warn", PS.user, true);
        if (this.isStaff(targetUser)) return;
        this.send("/warn " + targetUser.userid + (reason ? "," + reason : ""), { type: "command", measure: false });
    }

    mute(targetUser: User, hour?: boolean, reason?: string): void {
        if (!targetUser.online) return;
        if (!PS.user) throw new PSAPIError("NOT_LOGGED_IN");
        this.checkCan("mute", PS.user, true);
        if (this.isStaff(targetUser)) return;
        this.send("/mute " + targetUser.userid + (reason ? "," + reason : ""), { type: "command", measure: false });
    }

    awaitMessages(options: awaitMessageOptions<Room>): Promise<Message<Room>[] | null> {
        const isValidOption = (arg: unknown): arg is awaitMessageOptions<Room> => {
            if (typeof arg !== "object") return false;
            return (
                !!(arg as awaitMessageOptions<Room>)?.filter &&
                !!(arg as awaitMessageOptions<Room>)?.max &&
                !!(arg as awaitMessageOptions<Room>)?.time &&
                Object.keys(arg as awaitMessageOptions<Room>).length === 3
            );
        };
        if (!isValidOption(options)) throw new Error("Input must be valid object with these keys: filter, max, time");
        const room = this;
        return new Promise((resolve, reject) => {
            const timestamp = Date.now().toString();
            const CollectorOptions: MessageWaits<Room> = {
                timestamp,
                userid: undefined,
                roomid: this.roomid,
                messages: [],
                filter: options.filter,
                max: options.max,
                time: options.time,
                resolve: (m: Message<Room>[]): void => {
                    PS.addRoom(
                        Object.assign(room, {
                            waits: room.waits.filter((wait: MessageWaits<Room>) => wait.timestamp !== timestamp),
                        }) as RoomOptions
                    );
                    resolve(m);
                },
                reject: (m: Message<Room>[] | null): void => {
                    PS.addRoom(
                        Object.assign(room, {
                            waits: room.waits.filter((wait: MessageWaits<Room>) => wait.timestamp !== timestamp),
                        }) as RoomOptions
                    );
                    // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
                    reject(m ? m : []);
                },
                timeout: undefined,
            };
            const { messages, reject: rejectMessages } = CollectorOptions;
            CollectorOptions.timeout = setTimeout(() => void rejectMessages(messages.length ? messages : null), CollectorOptions.time);
            room.waits.push(CollectorOptions);
        });
    }

    getRank(user: User | string): GroupSymbol {
        let GlobalRank: GroupSymbol = " ";
        if (typeof user === "string") {
            user = Tools.toId(user);
            GlobalRank = global.Users.get(user)?.group ?? " ";
        } else {
            GlobalRank = user.group ?? " ";
            user = user.id;
        }
        if (!this.exists || !this.auth) return GlobalRank;
        if (this.visibility === "secret") return this.getRoomRank(user);
        const RoomRank: GroupSymbol = this.getRoomRank(user);
        if (!Tools.rankSymbols.includes(RoomRank)) return "+";
        return Tools.sortByRank([RoomRank, GlobalRank])[0] as GroupSymbol;
    }

    getRoomRank(userid: string): GroupSymbol {
        userid = Tools.toId(userid);
        let rank: GroupSymbol = " ";
        if (!this.auth) return rank;

        for (const [auth, users] of Object.entries(this.auth)) {
            if (users.includes(userid)) {
                rank = auth as GroupSymbol;
                break;
            }
        }
        return rank;
    }

    checkCan(permission: RoomPermissions, user: User | string, strict?: boolean): boolean {
        if (!this.exists || !this.auth) {
            if (strict) throw new PSAPIError("EMPTY", "Room");
            else return false;
        }
        if (!PS.status.loggedIn) {
            if (strict) throw new PSAPIError("NOT_LOGGED_IN");
            else return false;
        }
        let auth: GroupSymbol = " ";
        switch (permission) {
            case "chat":
                auth = " ";
                break;
            case "broadcast":
                auth = "+";
                break;
            case "show":
            case "hidetext":
            case "warn":
            case "tour":
            case "mute":
            case "announce":
            case "announcement":
                auth = "%";
                break;
            case "ban":
            case "roomban":
            case "rfaq":
                auth = "@";
                break;
            case "html":
            case "declare":
                auth = "*";
                break;
            case "roomintro":
                auth = "#";
                break;
            default:
                if (strict) throw new PSAPIError("PERMISSION_NOT_FOUND", permission satisfies never);
                else return false;
        }
        const userAuth = this.getRank(user instanceof User ? user.id : user);
        const can = Tools.isHigherRank(userAuth, auth);
        if (strict && !can) throw new PSAPIError("PERMISSION_DENIED", auth, userAuth);
        else return can;
    }

    hasRank(rank: GroupNames | GroupSymbol, user: User | string): boolean {
        if ((user instanceof User && user.locked) || !rank) return false;
        let auth = this.getRank(user);
        if (!Tools.rankSymbols.includes(auth)) auth = Tools.toGroupSymbol(auth as Exclude<typeof auth, GroupSymbol>);
        if (!Tools.rankSymbols.includes(rank as GroupSymbol)) rank = Tools.toGroupSymbol(rank as Exclude<typeof rank, GroupSymbol>);
        return Tools.isHigherRank(auth, rank as GroupSymbol);
    }

    isMuted(userid: string): boolean {
        const mutedUsers = this.users.filter((e) => e.startsWith("!")).map((u) => Tools.toId(u));
        if (!mutedUsers.length) return false;
        userid = Tools.toId(userid);
        return mutedUsers.includes(userid);
    }

    isVoice(userid: string): boolean {
        userid = Tools.toId(userid);
        const rank = this.getRoomRank(userid);
        if (!Tools.rankSymbols.includes(rank)) return true;
        return rank === "+";
    }

    isDriver(userid: string): boolean {
        userid = Tools.toId(userid);
        if (!this.exists) return false;
        return this.auth["%"]?.includes(userid) ?? false;
    }

    isMod(userid: string): boolean {
        userid = Tools.toId(userid);
        if (!this.exists) return false;
        return this.auth["@"]?.includes(userid) ?? false;
    }

    isBot(userid: string): boolean {
        userid = Tools.toId(userid);
        if (!this.exists) return false;
        return this.auth["*"]?.includes(userid) ?? false;
    }

    isOwner(userid: string): boolean {
        userid = Tools.toId(userid);
        if (!this.exists) return false;
        return this.auth["#"]?.includes(userid) ?? false;
    }

    isRoomStaff(userid: string): boolean {
        if (!this.exists) return false;
        return this.isDriver(userid) || this.isMod(userid) || this.isOwner(userid);
    }

    isStaff(user: User): boolean {
        if (this.exists) {
            if (user.online) return user.isGlobalStaff || this.isRoomStaff(user.userid);
            else return this.isRoomStaff(user.userid);
        }
        return false;
    }

    getOnlineStaffs(ignoreGlobals?: boolean, checkAlts?: boolean): Collection<string, User> {
        return this.userCollection.filter((u) => {
            if (!this.isStaff(u)) {
                if (checkAlts) {
                    return u.alts.some((a) => {
                        if (ignoreGlobals) return this.isRoomStaff(a);
                        else {
                            const altUser = global.Users.get(a);
                            if (altUser) return this.isStaff(altUser);
                            else return false;
                        }
                    });
                } else return false;
            }
            if (ignoreGlobals) {
                if (!this.isRoomStaff(u.userid)) return false;
                else return true;
            } else return true;
        });
    }
}

export class BattleRoom extends Room {
    turn: number = 0;
    tier: string = "";
    rules: string[] = [];
    p1: {
        user?: User;
        rating: number;
        pokemons: IBattlePokemonType[];
    } = { rating: 1000, pokemons: [] };
    p2: {
        user?: User;
        rating: number;
        pokemons: IBattlePokemonType[];
    } = { rating: 1000, pokemons: [] };
    avgRating: number = 1000;

    constructor(init: Room | RoomOptions, noinit?: boolean) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        super(init as any as RoomOptions, noinit);
        this.visibility = "public";
    }

    setPlayers(players: { p1?: User; p2?: User }) {
        if (players.p1) this.p1.user = players.p1;
        if (players.p2) this.p2.user = players.p2;
    }

    addPokemon(player: "p1" | "p2", data: IBattlePokemonType) {
        this[player].pokemons.push(data);
    }

    setTier(tier: string) {
        this.tier = tier;
    }

    addRule(rule: string) {
        this.rules.push(rule);
    }

    setRating(ratings: { p1?: number; p2?: number }) {
        if (ratings.p1) this.p1.rating = ratings.p1;
        if (ratings.p2) this.p2.rating = ratings.p2;
        this.setAverage();
    }

    setAverage(): number {
        const avg = (this.p1.rating + this.p2.rating) / 2;
        this.avgRating = avg;
        return avg;
    }

    update(): this {
        this.setUsers();
        const room = global.Rooms.get(this.id);
        if (!room) return this;
        Object.assign(this, room);
        return this;
    }

    fetch(force?: boolean): Promise<BattleRoom> {
        return PS.fetchBattleRoom(this.roomid, !!force);
    }
}

export class RawRoomData extends Collection<string, RoomOptions> {
    override get(roomid: string): RoomOptions | undefined {
        return super.get(Tools.toId(roomid));
    }

    override has(roomid: string): boolean {
        return super.has(Tools.toId(roomid));
    }

    override set(roomid: string, user: RoomOptions): this {
        super.set(Tools.toId(roomid), user);
        return this;
    }

    override delete(roomid: string): boolean {
        return super.delete(Tools.toId(roomid));
    }
}

export class BattleRooms extends Collection<string, BattleRoom> {
    override get(roomid: string): BattleRoom | undefined {
        return super.get(Tools.toId(roomid));
    }

    override has(roomid: string): boolean {
        return super.has(Tools.toId(roomid));
    }

    override set(roomid: string, room: BattleRoom): this {
        super.set(Tools.toId(roomid), room);
        return this;
    }

    override delete(roomid: string): boolean {
        return super.delete(Tools.toId(roomid));
    }

    fetch(roomid: string, force?: boolean): ReturnType<Client["fetchRoom"]> {
        return PS.fetchRoom.call(PS, roomid, !!force);
    }
}

export class Rooms extends Collection<string, Room> {
    aliases: Dict<string> = {};
    raw = new RawRoomData();
    battles = new BattleRooms();

    constructor(iterable?: Iterable<readonly [string, Room]> | null) {
        super(iterable);
        if (global.Config) {
            this.aliases = Config.roomAliases ? cloneDeep(Config.roomAliases) : {};
        }
    }

    override get(roomid: string): Room | undefined {
        return super.get(this.toFormalId(roomid));
    }

    override has(roomid: string): boolean {
        return super.has(this.toFormalId(roomid));
    }

    override set(roomid: string, room: Room): this {
        super.set(this.toFormalId(roomid), room);
        return this;
    }

    override delete(roomid: string): boolean {
        return super.delete(this.toFormalId(roomid));
    }

    toFormalId(alias: string): string {
        alias = Tools.toRoomId(alias);
        return this.aliases[alias] ?? alias;
    }

    fetch(roomid: string, force?: boolean): ReturnType<Client["fetchRoom"]> {
        return PS.fetchRoom.call(PS, roomid, !!force);
    }
}

export const initializeGlobalRooms = () => {
    global.Rooms = new Rooms();
};
