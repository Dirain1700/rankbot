"use strict";

import { cloneDeep } from "lodash";
import { Room, User } from "@dirain/client";

import type { Message, GroupSymbol } from "@dirain/client";

import type { BaseCommandDefinitions, BaseCommandData, BaseCommandGuide, CommandErrorInputType } from "../../types/commands";

export class CommandParser {
    commandsDir = "./commands";

    constructor() {} // eslint-disable-line @typescript-eslint/no-empty-function

    async loadCommands(): Promise<void> {
        const files = fs
            .readdirSync(path.resolve(__dirname, this.commandsDir))
            .filter((f) => f.endsWith(".js"))
            .map((f) => f.trim());

        return void Promise.allSettled(
            files.map((file) => {
                const filePath = this.commandsDir + "/" + file.trim();
                import(filePath)
                    .then(({ commands }) => {
                        for (const [commandName, commandData] of Object.entries(commands as BaseCommandDefinitions)) {
                            const clone = cloneDeep(commandData);
                            clone.original = true;
                            Commands[commandName] = clone;
                            if (commandData.aliases)
                                for (const alias of commandData.aliases) {
                                    const cloneNeo = commandData;
                                    cloneNeo.original = commandName;
                                    Commands[alias] = cloneNeo;
                                }
                        }
                    })
                    .catch(console.error);
            })
        );
    }

    getCommandData(name: string): BaseCommandData | null {
        name = Tools.toId(name);
        const command = Commands[name];
        if (!command) return null;
        else return command;
    }

    getCommandGuide(name: string): BaseCommandGuide | null {
        const command = this.getCommandData(name);
        if (!command) return null;
        const guide = (({ run, ...data }) => data)(command); // eslint-disable-line @typescript-eslint/no-unused-vars
        return guide;
    }

    isCommandMessage(message: string): boolean {
        return Config.commandPrefix ? message.startsWith(Config.commandPrefix) : false;
    }

    parse(message: Message): boolean {
        if (!this.isCommandMessage(message.content)) return false;

        message.content = message.content.replace(Config.commandPrefix, "");

        const { content } = message;
        let command = "";
        let argument = "";
        const spaceIndex = content.indexOf(" ");
        if (spaceIndex === -1) {
            command = Tools.toId(content);
        } else {
            command = content.substring(0, spaceIndex);
            argument = content.substring(spaceIndex + 1);
        }
        command = Tools.toId(command);
        let originalCommand = this.getCommandData(command)?.original;

        if (!originalCommand) return false;
        if (originalCommand === true) originalCommand = command;

        let result: boolean = true;

        try {
            const { target, author, time } = message;
            new CommandContext(originalCommand, command, argument, target, author, time).run();
        } catch (e: unknown) {
            console.error(e);
            result = false;
        }

        return result;
    }
}

export class CommandContext<T extends Room | User = Room | User> {
    originalCommand: string;
    command: string;
    room: T;
    argument: string;
    user: User;
    timestamp: number;

    constructor(originalCommand: string, cmd: string, argument: string, room: T, user: User, timestamp: number) {
        this.originalCommand = originalCommand;
        this.command = cmd;
        this.argument = argument;
        this.room = room;
        this.user = user;
        this.timestamp = timestamp;
    }

    inPm(): this is CommandContext<User> {
        return this.room instanceof User;
    }

    inRoom(): this is CommandContext<Room> {
        return this.room instanceof Room;
    }

    run(): void {
        /* eslint-disable @typescript-eslint/no-non-null-assertion */
        const command = Commands[this.originalCommand];
        if (!command) return;
        //if (command.developerOnly && !(this.user.userid in Config.developers)) return;
        if (this.inRoom() && command.pmOnly) return;
        else if (this.inPm() && command.chatOnly) return;

        command.run.call(this, this.argument, this.room, this.user, this.command, this.timestamp);
    }

    say(content: string): void {
        this.room.send(Tools.toString(content));
    }

    sayError(err: CommandErrorInputType, ...args: string[]): void {
        if (!PS.user) return;
        let message: string;

        switch (err) {
            case "INVALID_ROOM":
            case "INVALID_BOT_ROOM": {
                if (args[0]) message = args[0] + " is not one of " + PS.user.name + "'s room.";
                else message = "You must specifiy at least one room.";
                break;
            }
            case "MISSING_BOT_RANK": {
                if (args[0]) message = "Required Bot (*) rank for " + args[0] + " but not provided.";
                else message = "Required Bot (*) rank but jot provided.";
                break;
            }
            case "PERMISSION_DENIED": {
                if (args[0]) {
                    const index = Tools.rankSymbols.indexOf(args[0] as GroupSymbol);
                    if (index === -1) message = "Access denied.";
                    message =
                        "Access denied. Requires: " +
                        Tools.rankSymbols
                            .filter((_, i) => i <= index)
                            .slice(1)
                            .join(" ");
                } else {
                    message = "Access denied.";
                }
                break;
            }
            case "WORDLE_DISABLED": {
                if (args[0]) {
                    message = "Wordle disabled for room " + args[0] + ".";
                } else {
                    message = "Wordle disabled.";
                }
                break;
            }

            default:
                message = "Unknown error type: " + (err satisfies never);
        }
        this.say(message);
    }

    sayCode(code: string): void {
        return this.sayCommand("!", "code", code);
    }

    sayCommand(prefix: string, command: string, args: string): void {
        if (!PS.user) return;
        command = Tools.toId(command);
        if (this.inRoom()) {
            if (prefix === "!") {
                if (command === "show") this.room.hasRank("%", PS.user);
                else this.room.hasRank("+", PS.user);
                return this.say(prefix + command + " " + args);
            } else {
                this.room.hasRank("+", PS.user);
                return this.room.send(prefix + command + " " + args);
            }
        } else {
            if (prefix === "!" && command === "show") PS.user.hasRank("%");
            return void this.user.send(prefix + command + " " + args);
        }
    }
}