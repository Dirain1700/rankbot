import type { Weaken } from "./utils";
import type { RoomData } from "../src/ps/storage";

export interface IGeneralUserDataBase {
    userid: string;
    alts: string[];
    rooms: RoomData;
}

export interface IGeneralUserDataBaseJSON extends Weaken<IGeneralUserDataBase, "rooms"> {
    rooms: [string, IRoomDataBase][];
}

export interface IRoomDataBase {
    roomid: string;
    userid: string;
    hidetext?: number;
    warn?: number;
    mute?: number;
    roomban?: number;
    quality: number;
}
