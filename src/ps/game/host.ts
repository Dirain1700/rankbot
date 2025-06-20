"use strict";

import { Game } from "../game";

import type { Room, User } from "../client/src";

const HOST_TIME_LIMIT_ANNOUNCE = 20 * 60 * 1000;
const HOST_TIME_LIMIT = HOST_TIME_LIMIT_ANNOUNCE + 5 * 60 * 1000;

export class HostGame extends Game {
    userHosted: true = true as const;
    host: User;
    announceTime: NodeJS.Timer | undefined = undefined;
    stores = new Map<string, string>();

    constructor(target: Room, host: User, freejoin?: boolean) {
        super(target);
        this.host = host;
        this.freejoin = !!freejoin;
        this.timeLimit = setTimeout(() => this.onTimeLimit(), HOST_TIME_LIMIT);
        this.announceTime = setTimeout(() => this.onAnnounceTime(), HOST_TIME_LIMIT_ANNOUNCE);
    }

    getStartHtml(): string {
        return "<center style='padding: 5px 0 5px 0;'>" + this.name + "</center>";
    }

    onStart(): this {
        this.room.send(this.name + " has started!");
        return this;
    }

    onEnd(force?: boolean): this {
        if (force) this.room.send(this.name + " was forcibly ended!");
        this.ended = true;
        this.stores.clear();
        this.timeLimit = undefined;
        this.announceTime = undefined;
        this.timeout = undefined;
        return this;
    }

    setStore(key: string, value: string, noKey?: boolean): { key: string; value: string } | void {
        key = Tools.toRoomId(key);
        if (!key && !noKey) return this.room.send("The key can include only alphabet, number, and hyphen");
        if (!value) return this.room.send("The value must not be empty.");
        this.stores.set(key, value);
        return { key, value };
    }

    getStore(key: string, noKey?: boolean): { key: string; value: string } | undefined {
        key = Tools.toRoomId(key);
        if (!key && !noKey) return;
        const value = this.stores.get(key);
        if (!value) return;
        return { key, value };
    }

    onTimeLimit() {
        this.room.send("Time is up!");
        this.end();
    }

    onAnnounceTime() {
        this.room.send(this.host.name + ", there are 5 minutes only remaining on the host!");
    }

    setTimeout(limit: number, label?: string): NodeJS.Timer | void {
        if (!limit || limit < 5000 || !this.startTime || limit > (Date.now() - this.startTime) / 1000)
            return this.room.send("Number must be smaller than the current remaining time or bigger than 5 sec.");

        if (this.timeout) clearTimeout(this.timeout);
        this.room.send("Timer set for: " + Tools.toDurationString(limit, false) + (label ? ". (label: " + label + ")" : "."));
        this.timeout = setTimeout(() => this.onTimeout(label), limit);
    }

    onTimeout(label?: string): void {
        this.timeout = undefined;
        this.room.send(this.host.name + ", timer is up!" + (label ? "(label: " + label + ")" : ""));
    }
}
