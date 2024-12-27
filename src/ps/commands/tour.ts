"use strict";

import type { BasePSCommandDefinitions } from "../../../types/commands";
import type { IScheduledTournamentData } from "../../../types/database";

export const commands: BasePSCommandDefinitions = {
    setnexttournament: {
        run() {
            if (!this.inRoom()) return this.sayError("INVALID_ROOM");
            //if (!this.room.isStaff(this.user)) return;
            // if (!this.room.checkCan("broadcast", this.user, false)) return;

            if (TournamentManager.schedules.has(this.room.id)) {
                return this.say("Another tournament is already scheduled already.");
            }

            // eslint-disable-next-line prefer-const
            let [format, ...options] = this.argument.split(",");
            format = Tools.toId(format || "");
            if (!format) return this.say("Please specify the format.");
            let name: string = "",
                type: IScheduledTournamentData["type"] = undefined,
                generator: number | null = null,
                cap: number | null = null;

            for (const option of options) {
                if (!type && ["rr", "roundrobin"].includes(Tools.toId(option))) {
                    type = "Round Robin";
                    continue;
                }
                const [key, value] = option.split(":").map((e) => e.trim());
                if (!key || !value) continue;
                switch (key) {
                    case "name":
                        name = value;
                        break;
                    case "generator":
                        generator = parseInt(value);
                        break;
                    case "cap":
                        cap = parseInt(value);
                        break;
                }
            }

            const scheduleSubmition: IScheduledTournamentData = {
                format,
                type,
            };

            if (name) scheduleSubmition.name = name;
            if (generator) scheduleSubmition.rounds = generator;
            if (cap) scheduleSubmition.cap = cap;

            TournamentManager.schedules.set(this.room.id, scheduleSubmition);

            if (!this.room.tour) {
                TournamentManager.timers.set(
                    this.room.roomid,
                    setTimeout(() => {
                        TournamentManager.create(this.room, scheduleSubmition);
                    }, TournamentManager.UntilNewTour)
                );
            }
            this.parse("nexttournament", "");
        },
        chatOnly: true,
        aliases: ["setnexttour"],
        syntax: ["[format]", "name: [name]", "type: [type (elim or rr)]", "generator: [generator]", "cap: [playercap]"],
    },
    nexttournament: {
        run() {
            if (this.argument) return this.parse("setnexttournament", this.argument);
            if (!this.inRoom()) return this.sayError("INVALID_ROOM");
            // if (!this.room.checkCan("broadcast", this.user, false)) return;

            const schedule = TournamentManager.schedules.get(this.room.id);
            if (!schedule) {
                return this.say("There is no tournament scheduled.");
            }

            let message = `The next tournament will be a ${schedule.format} tournament`;
            if (schedule.name) message += ` named "${schedule.name}"`;
            if (schedule.type === "Round Robin") message += " with a round robin format";
            if (schedule.cap) message += ` with a cap of ${schedule.cap} players`;
            if (schedule.rounds) message += ` with ${schedule.rounds} rounds`;
            this.say(message);
        },
        chatOnly: true,
        aliases: ["nexttour"],
    },
    endtournament: {
        run() {
            if (!this.inRoom()) return this.sayError("INVALID_ROOM");
            // if (!this.room.isStaff(this.user)) return;
            // if (!this.room.checkCan("broadcast", this.user, false)) return;

            if (!this.room.tour) {
                return this.say("There is no tournament running.");
            }

            this.room.tour.forceEnd();
        },
        chatOnly: true,
        aliases: ["endtour"],
        syntax: [],
    },
};
