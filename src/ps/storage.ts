"use strict";

import { Collection } from "discord.js";

import type { IGeneralUserDataBase, IGeneralUserDataBaseJSON, IRoomDataBase } from "../../types/database";
import type { Dict } from "../../types/utils";

export class RoomData extends Collection<string, IRoomDataBase> {
    userid: string;

    constructor(iterable: Iterable<readonly [string, IRoomDataBase]> | null | undefined, userid: string) {
        super(iterable);
        this.userid = userid;
    }

    override get(roomid: string): IRoomDataBase {
        roomid = Tools.toRoomId(roomid);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        if (this.has(roomid)) return super.get(roomid)!;
        const data = { userid: this.userid, roomid, quality: 100 };
        this.set(roomid, data);
        return data;
    }

    override has(roomid: string): boolean {
        return super.has(Tools.toRoomId(roomid));
    }

    override set(roomid: string, room: IRoomDataBase): this {
        super.set(Tools.toRoomId(roomid), room);
        return this;
    }

    override delete(roomid: string): boolean {
        return super.delete(Tools.toRoomId(roomid));
    }
}

export class Database extends Collection<string, IGeneralUserDataBase> {
    databasesDirectory = path.resolve("./databases");
    globalDataPath = path.join(this.databasesDirectory, "global.json");

    constructor(iterable?: Iterable<readonly [string, IGeneralUserDataBase]> | null | undefined) {
        super(iterable);
        if (!fs.existsSync(this.databasesDirectory)) {
            fs.mkdirSync(this.databasesDirectory, { recursive: true });
        }

        this.loadGlobal();
        setInterval(() => this.exportGlobal(), 30 * 60 * 1000);
    }

    override get(userid: string): IGeneralUserDataBase {
        userid = Tools.toId(userid);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        if (this.has(userid)) return super.get(userid)!;
        const data = { userid, alts: [], rooms: new RoomData([], userid) };
        this.set(userid, data);
        return data;
    }

    override has(userid: string): boolean {
        return super.has(Tools.toId(userid));
    }

    override set(userid: string, user: IGeneralUserDataBase): this {
        super.set(Tools.toId(userid), user);
        return this;
    }

    override delete(userid: string): boolean {
        return super.delete(Tools.toId(userid));
    }

    loadGlobal() {
        if (!fs.existsSync(this.globalDataPath)) fs.writeFileSync(this.globalDataPath, "{}");
        const stringData = fs.readFileSync(this.globalDataPath, "utf-8");
        try {
            const json: Dict<IGeneralUserDataBaseJSON> = JSON.parse(stringData) as Dict<IGeneralUserDataBaseJSON>;
            for (const userid in json) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const u = json[userid]!;
                this.set(userid, {
                    userid: u.userid,
                    alts: u.alts,
                    rooms: new RoomData(u.rooms ?? [], u.userid),
                });
            }
        } catch (e) {
            throw e as Error;
        }
    }

    exportGlobal() {
        const userJSON: Dict<IGeneralUserDataBaseJSON> = {};
        for (const [userid, u] of this.entries()) {
            const roomJSON: IGeneralUserDataBaseJSON["rooms"] = [];
            for (const [roomid, r] of u.rooms.entries()) {
                roomJSON.push([roomid, r]);
            }
            userJSON[userid] = {
                userid,
                alts: u.alts,
                rooms: roomJSON,
            } as IGeneralUserDataBaseJSON;
        }
        fs.writeFileSync(this.globalDataPath, JSON.stringify(userJSON, null, 4));
    }
}

export const initializeGlobalDatabase = () => {
    global.Database = new Database();
};
