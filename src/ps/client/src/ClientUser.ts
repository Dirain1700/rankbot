"use strict";

import { User } from "./User";

import type { UserSettings } from "../types/ClientUser";
import type { UserOptions } from "../types/User";

export class ClientUser extends User {
    trusted: boolean;
    settings: UserSettings = {};

    constructor(init: UserOptions) {
        super(init);
        this.trusted = false;
    }

    setAvatar(avatar: string | number): Promise<User> {
        if (typeof avatar === "number") avatar = String(avatar);
        BotClient.ps.noreplySend(`|/avatar ${avatar}`);
        return Users.fetch(this.userid);
    }

    setStatus(status: string): void {
        if (status.length > 52) return console.error(new Error("Status must be shorter than 52 characters."));
        BotClient.ps.noreplySend(`|/status ${status}`);
    }

    setSettings(data: UserSettings): void {
        if (typeof data !== "object") throw new TypeError("Input must be object.");
        BotClient.ps.noreplySend("|/updatesettings " + JSON.stringify(data));
    }

    blockChallenges(): void {
        BotClient.ps.noreplySend("|/blockchallenges");
    }
}
