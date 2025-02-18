"use strict";

import type { IScheduledOfficialTournamentData, ITournamentMonthlySchedule } from "../../types/database";

const schedulesFolder = "databases/schedules";
const DEFAULT_TOUR_TYPE = "Elimination";

export function getTournamentSchedules(roomid: string, year: number, month: number): ITournamentMonthlySchedule {
    const filePath = `${schedulesFolder}/${roomid}/${year}${String(month).padStart(2, "0")}.json`;
    if (!fs.existsSync(filePath)) return {};
    let loadData: ITournamentMonthlySchedule = {};
    try {
        loadData = JSON.parse(fs.readFileSync(filePath, "utf8")) as ITournamentMonthlySchedule;
    } catch (e) {
        console.error(e);
    }
    return sortSchedules(loadData);
}

export function updateTournamentSchedules(roomid: string, year: number, month: number, data: ITournamentMonthlySchedule) {
    const filePath = `${schedulesFolder}/${roomid}/${year}${String(month).padStart(2, "0")}.json`;
    if (!fs.existsSync(`${schedulesFolder}/${roomid}`)) {
        fs.mkdirSync(`${schedulesFolder}/${roomid}`, { recursive: true });
    }
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
        return data;
    } else {
        let currentData: ITournamentMonthlySchedule = {};
        try {
            currentData = JSON.parse(fs.readFileSync(filePath, "utf8")) as ITournamentMonthlySchedule;
        } catch (e) {
            console.error(e);
        }
        for (const day in data) {
            if (!(day in currentData)) {
                /* eslint-disable @typescript-eslint/no-non-null-assertion */
                currentData[day] = data[day]!;
                if (currentData[day].length > 1) {
                    currentData[day] = currentData[day].sort((a, b) => {
                        const timeA = a.time.split(":");
                        const timeB = b.time.split(":");
                        if (timeA[0]! === timeB[0]) {
                            return parseInt(timeA[1]!) - parseInt(timeB[1]!);
                        }
                        return parseInt(timeA[0]!) - parseInt(timeB[0]!);
                    });
                }
                /* eslint-enable */
            }
        }
        fs.writeFileSync(filePath, JSON.stringify(currentData, null, 4));
        return currentData;
    }
}

function sortSchedules(data: ITournamentMonthlySchedule): ITournamentMonthlySchedule {
    for (const day in data) {
        if (day.length < 2) continue;
        /* eslint-disable @typescript-eslint/no-non-null-assertion */
        data[day] = data[day]!.sort((a, b) => {
            const timeA = a.time.split(":");
            const timeB = b.time.split(":");
            if (timeA[0]! === timeB[0]) {
                return parseInt(timeA[1]!) - parseInt(timeB[1]!);
            }
            return parseInt(timeA[0]!) - parseInt(timeB[0]!);
        });
        /* eslint-enable */
    }
    return data;
}

export function getMostRecentTournamentToday(roomid: string): IScheduledOfficialTournamentData | null {
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    const day = new Date().getDate();
    const schedules = getTournamentSchedules(roomid, year, month);
    const currentDay = schedules[day];
    if (currentDay) {
        for (const tour of currentDay) {
            const tourTime = new Date(`${month}/${day}/${new Date().getFullYear()} ${tour.time}`);
            // I'm ensure that the array is sorted, so the first tournament that hasn't started yet is the most recent
            if (tourTime > new Date()) {
                return tour;
            }
        }
        return null;
    }
    return null;
}

export function createScheduledTournament(roomid: string, tourData: IScheduledOfficialTournamentData) {
    const targetRoom = Rooms.get(roomid);
    if (!targetRoom) return;
    targetRoom.tourTimer = null;
    Rooms.set(targetRoom.roomid, targetRoom);
    targetRoom.send(`/tour create ${tourData.format}, ${tourData.type ?? DEFAULT_TOUR_TYPE},, ${tourData.rounds ?? 1}`);
    if (tourData.rules?.length) {
        targetRoom.send(`/tour rules ${tourData.rules.join(", ")}`);
    }
    if (tourData.cap && tourData.cap > 4) {
        targetRoom.send(`/tour cap ${tourData.cap}`);
    }
    if (tourData.name) {
        targetRoom.send(`/tour name ${tourData.name}`);
    }
}

export function setNextScheduledTournament(roomid: string, force?: boolean): ReturnType<typeof getMostRecentTournamentToday> | null {
    const mostRecent = getMostRecentTournamentToday(roomid);
    if (!mostRecent) return null;
    const targetRoom = Rooms.get(roomid);
    if (!targetRoom) return null;
    const now = new Date();
    const tournamentTime = new Date(`${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()} ${mostRecent.time}`);
    if (targetRoom.tourTimer) {
        if (force) clearTimeout(targetRoom.tourTimer);
        else return null;
    }
    targetRoom.tourTimer = setTimeout(() => {
        createScheduledTournament(roomid, mostRecent);
        setNextScheduledTournament(roomid);
    }, tournamentTime.getTime() - now.getTime());
    return mostRecent;
}
