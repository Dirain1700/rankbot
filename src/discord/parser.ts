"use strict";

import { cloneDeep } from "lodash";

import type {
    BaseDiscordCommandDefinitions,
    BaseDiscordRunTimeCommandDefinitions,
    BaseDiscordRunTimeGuildCommandDefinitions,
    BaseDiscordGuildCommandDefinitions,
    DiscordCommandSingleData,
    DiscordCommandSingleGuide,
    DiscordCommandErrorInputType,
} from "../../types/commands";
import type { Collection, SendableChannels, TextBasedChannel } from "discord.js";
import type {
    ApplicationCommand,
    ApplicationCommandData,
    ChatInputCommandInteraction,
    BaseMessageOptions,
    InteractionReplyOptions,
    Snowflake,
} from "discord.js";

const GUILD_COMMAND_DEFINITION_FILE = "guilds.js";
const COMMAND_DATA_FILE_PATH = "./config/commands.json";

export class DiscordCommandParser {
    commandsDir = "./commands/interaction";

    constructor() {}

    async loadCommands(): Promise<[BaseDiscordRunTimeCommandDefinitions, BaseDiscordRunTimeGuildCommandDefinitions]> {
        const files = fs
            .readdirSync(path.resolve(__dirname, this.commandsDir))
            .filter((f) => f.endsWith(".js"))
            .map((f) => f.trim());

        return Promise.allSettled(
            files.map((file): Promise<[BaseDiscordRunTimeCommandDefinitions, BaseDiscordRunTimeGuildCommandDefinitions]> => {
                const loadedGlobalCommands: BaseDiscordRunTimeCommandDefinitions = {};
                const loadedGuildCommands: BaseDiscordRunTimeGuildCommandDefinitions = {};

                const filePath = this.commandsDir + "/" + file.trim();
                return (
                    import(filePath)
                        /* eslint-disable @typescript-eslint/no-explicit-any */
                        .then(({ commands }): [BaseDiscordRunTimeCommandDefinitions, BaseDiscordRunTimeGuildCommandDefinitions] => {
                            if (file.endsWith(GUILD_COMMAND_DEFINITION_FILE)) {
                                for (const [guildId, guildCommands] of Object.entries(commands as BaseDiscordGuildCommandDefinitions)) {
                                    loadedGuildCommands[guildId] = {};

                                    for (const [commandName, commandData] of Object.entries(guildCommands)) {
                                        const clone = cloneDeep(commandData);
                                        (clone as any as DiscordCommandSingleData).name = commandName;
                                        loadedGuildCommands[guildId][commandName] = clone as any as DiscordCommandSingleData;
                                        if (commandData.aliases)
                                            for (const alias of commandData.aliases) {
                                                const cloneNeo = cloneDeep(commandData);
                                                (cloneNeo as any as DiscordCommandSingleData).name = alias;
                                                (cloneNeo as any as DiscordCommandSingleData).resolvable.name = alias;
                                                loadedGuildCommands[guildId][alias] = cloneNeo as any as DiscordCommandSingleData;
                                            }
                                    }
                                }
                            } else {
                                for (const [commandName, commandData] of Object.entries(commands as BaseDiscordCommandDefinitions)) {
                                    const clone = cloneDeep(commandData);
                                    (clone as any as DiscordCommandSingleData).name = commandName;
                                    loadedGlobalCommands[commandName] = clone as any as DiscordCommandSingleData;
                                    if (commandData.aliases)
                                        for (const alias of commandData.aliases) {
                                            const cloneNeo = cloneDeep(commandData);
                                            (cloneNeo as any as DiscordCommandSingleData).name = alias;
                                            (cloneNeo as any as DiscordCommandSingleData).resolvable.name = alias;
                                            loadedGlobalCommands[alias] = cloneNeo as any as DiscordCommandSingleData;
                                        }
                                }
                            }
                            return [loadedGlobalCommands, loadedGuildCommands];
                        })
                        .catch((e) => {
                            console.error(e);
                            return [loadedGlobalCommands, loadedGuildCommands];
                        })
                );
                /* eslint-enable */
            })
        ).then((loadedCommands) => {
            const globalCommandsCollection: BaseDiscordRunTimeCommandDefinitions = {};
            const guildCommandsCollection: BaseDiscordRunTimeGuildCommandDefinitions = {};

            for (const [loadedGlobalCommands, loadedGuildCommands] of loadedCommands
                .filter(
                    (r): r is PromiseFulfilledResult<[BaseDiscordRunTimeCommandDefinitions, BaseDiscordRunTimeGuildCommandDefinitions]> =>
                        Tools.isPromiseFulfilled(r)
                )
                .map((e) => e.value)) {
                for (const [commandName, commandData] of Object.entries(loadedGlobalCommands)) {
                    if (commandName in globalCommandsCollection) {
                        throw new Error("Duplication detected on loadCommands: " + commandName);
                    } else {
                        globalCommandsCollection[commandName] = commandData;
                    }
                }

                for (const [guildId, commands] of Object.entries(loadedGuildCommands)) {
                    if (!guildCommandsCollection[guildId]) {
                        guildCommandsCollection[guildId] = {};
                    }
                    for (const [commandName, commandData] of Object.entries(commands)) {
                        if (commandName in guildCommandsCollection[guildId]) {
                            throw new Error("Duplication detected on loadCommands: " + commandName + " (Guild ID: " + guildId + ")");
                        } else {
                            guildCommandsCollection[guildId][commandName] = commandData;
                        }
                    }
                }
            }
            return [globalCommandsCollection, guildCommandsCollection];
        });
    }

    async register(): Promise<{ result: Collection<Snowflake, ApplicationCommand>[]; errors: unknown[] }> {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises, no-async-promise-executor
        return new Promise(async (resolve) => {
            const returnObject: { result: Collection<Snowflake, ApplicationCommand>[]; errors: unknown[] } = { result: [], errors: [] };

            if (!BotClient.disc.application) return resolve(returnObject);
            const [globalCommands, guildCommands] = await this.loadCommands();
            const uploadableGlobalCommandData: ApplicationCommandData[] = Object.values(globalCommands).map((c) =>
                this.getResolvableCommandData(c)
            );
            const uploadableGuildCommandData: [Snowflake, ApplicationCommandData[]][] = [];
            for (const [guildId, commands] of Object.entries(guildCommands)) {
                const guildCommand = Object.values(commands).map((c) => this.getResolvableCommandData(c));
                if (guildCommand.length) {
                    uploadableGuildCommandData.push([guildId, guildCommand]);
                }
            }

            if (uploadableGlobalCommandData.length) {
                await BotClient.disc.application.commands
                    .set(uploadableGlobalCommandData)
                    .then((d) => returnObject.result.push(d))
                    .catch((e) => returnObject.errors.push(e));
            }

            let timer: NodeJS.Timeout | undefined = undefined;

            if (uploadableGuildCommandData) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-misused-promises
                timer = setInterval(async () => {
                    await uploadGuildCommand();
                }, 500);
            }

            async function uploadGuildCommand() {
                if (!uploadableGuildCommandData.length) {
                    timer = undefined;
                    const data: Record<Snowflake, { name: string; guildId: Snowflake | null }> = {};
                    for (const collection of returnObject.result) {
                        for (const [id, cmd] of collection.entries()) {
                            data[id] = {
                                name: cmd.name,
                                guildId: cmd.guildId ?? null,
                            };
                        }
                    }
                    fs.writeFileSync(COMMAND_DATA_FILE_PATH, JSON.stringify(data, null, 4));
                    return resolve(returnObject);
                }
                /* eslint-disable @typescript-eslint/no-non-null-assertion */
                const command = uploadableGuildCommandData.shift()!;
                await BotClient.disc
                    .application!.commands.set(command[1], command[0])
                    .then((d) => returnObject.result.push(d))
                    .catch((e) => returnObject.errors.push(e));
                /* eslint-enable */
            }
        });
    }

    async setupGlobal(): Promise<Record<Snowflake, DiscordCommandSingleData>> {
        const obj: Record<Snowflake, DiscordCommandSingleData> = {};
        const [globalCommands, guildCommands] = await this.loadCommands();
        if (!fs.existsSync(COMMAND_DATA_FILE_PATH)) return obj;
        const CommandIds: [Snowflake, { name: string; guildId: Snowflake | null }][] = Object.entries(
            JSON.parse(fs.readFileSync(COMMAND_DATA_FILE_PATH, "utf-8")) as { [id: Snowflake]: { name: string; guildId: Snowflake | null } }
        );
        const nonExistentCommands: [DiscordCommandSingleData, Snowflake | null][] = [];
        for (const [commandName, commandData] of Object.entries(globalCommands)) {
            let dataExist = false;
            for (const [id, { name, guildId }] of CommandIds) {
                if (name === commandName && guildId === null) {
                    obj[id] = commandData;
                    dataExist = true;
                    break;
                }
            }
            if (!dataExist) nonExistentCommands.push([commandData, null]);
        }

        for (const [guildId, commands] of Object.entries(guildCommands)) {
            if (!Tools.isSnowflake(guildId)) throw new Error("Invalid guildId given: " + guildId);
            for (const [commandName, commandData] of Object.entries(commands)) {
                let dataExist = false;
                for (const [id, { name, guildId: guild }] of CommandIds) {
                    if (name === commandName && guild === guildId) {
                        obj[id] = commandData;
                        dataExist = true;
                        break;
                    }
                }
                if (!dataExist) nonExistentCommands.push([commandData, null]);
            }
        }
        if (nonExistentCommands.length) {
            console.error("Some commands was not found on Command ID List:");
            console.error(nonExistentCommands);
        }
        return obj;
    }

    getCommandData(id: Snowflake): DiscordCommandSingleData | null {
        const command = DiscordCommands[id];
        if (!command) return null;
        else return cloneDeep(command);
    }

    getCommandGuide(id: Snowflake): DiscordCommandSingleGuide | null {
        const command = this.getCommandData(id);
        if (!command) return null;
        const guide = (({ run, ...data }) => data)(command); // eslint-disable-line @typescript-eslint/no-unused-vars
        return guide;
    }

    getResolvableCommandData(data: DiscordCommandSingleGuide | DiscordCommandSingleData): ApplicationCommandData {
        data.name = Tools.toId(data.name);
        if (data.guildOnly) data.resolvable.dmPermission = false;
        return data.resolvable;
    }

    parse(interaction: ChatInputCommandInteraction): boolean {
        if (!interaction.channel) {
            void interaction.reply({
                content: "This interaction does not have a data of TextChannel; Please report this to developer",
                ephemeral: true,
            });
            return false;
        }

        const cmd = this.getCommandData(interaction.commandId);
        if (!cmd) return false;

        let result: boolean = true;

        try {
            new DiscordCommandContext(interaction).run();
        } catch (e: unknown) {
            console.error(e);
            result = false;
        }

        return result;
    }
}

export class DiscordCommandContext {
    interaction: ChatInputCommandInteraction;

    constructor(interaction: ChatInputCommandInteraction) {
        this.interaction = interaction;
    }

    run(): void {
        const command = DiscordCommands[this.interaction.commandId];
        if (!command || !this.interaction.channel) return;
        if (command.developerOnly && !Config.admin.includes(this.interaction.user.id)) return;
        if (command.dmOnly && !this.interaction.channel.isDMBased()) {
            return;
        } else {
            if (!this.interaction.inCachedGuild()) {
                return;
            }
            if (command.guildOnly && this.interaction.channel.isDMBased()) {
                return;
            }
        }
        if (command.disabled) return this.reply("This command is currently disbled.");

        command.run.call(this);
    }

    /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access */
    checkChat(content: any): string | BaseMessageOptions {
        if (!content.content) {
            return Tools.toString(content);
        } else {
            content.content = Tools.toString(content.content);
            return content as BaseMessageOptions;
        }
    }
    /* eslint-enable */

    reply(content: string | InteractionReplyOptions): void {
        void this.interaction.reply(this.checkChat(content));
    }

    sendChannel(content: string | BaseMessageOptions): void {
        if (this.interaction.channel && this.interaction.channel.isTextBased() && this.interaction.channel.isSendable())
            void (this.interaction.channel as TextBasedChannel & SendableChannels).send(this.checkChat(content));
    }

    sayError(err: DiscordCommandErrorInputType, options: InteractionReplyOptions, ...args: string[]): void {
        if (!BotClient.disc.user?.username) return;
        let content: string;

        switch (err) {
            case "INVALID_CHANNEL": {
                if (args[0]) content = args[0] + " is not one of " + BotClient.disc.user.username + "'s channel.";
                else content = "You must specifiy at least one of " + BotClient.disc.user.username + "'s chennel.";
                break;
            }

            case "INVALID_GUILD": {
                if (args[0]) content = args[0] + " is not one of " + BotClient.disc.user.username + "'s guild.";
                else content = "You must specifiy at least one of " + BotClient.disc.user.username + "'s guild.";
                break;
            }

            case "MISSING_PERMISSION": {
                if (args[0]) content = "Required permission for " + args[0] + " but not provided.";
                else content = "Required premission but not provided.";
                break;
            }

            case "PERMISSION_DENIED": {
                content = "Access denied.";
                break;
            }

            default:
                content = "Unknown error type: " + (err satisfies never);
        }
        options = Object.assign(options, { content, ephemeral: true });
        this.reply(options);
    }
}
