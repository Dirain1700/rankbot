"use strict";

import { cloneDeep } from "lodash";

import type {
    BaseDiscordCommandDefinitions,
    BaseDiscordCommandData,
    BaseDiscordCommandGuide,
    DiscordCommandErrorInputType,
} from "../../types/commands";
import type { ApplicationCommandData, ChatInputCommandInteraction, BaseMessageOptions, InteractionReplyOptions } from "discord.js";

export class DiscordCommandParser {
    commandsDir = "./commands/interaction";

    constructor() {} // eslint-disable-line @typescript-eslint/no-empty-function

    async loadCommands(): Promise<PromiseSettledResult<void>[]> {
        const files = fs
            .readdirSync(path.resolve(__dirname, this.commandsDir))
            .filter((f) => f.endsWith(".js"))
            .map((f) => f.trim());

        return Promise.allSettled(
            files.map((file) => {
                const filePath = this.commandsDir + "/" + file.trim();
                import(filePath)
                    .then(({ commands }) => {
                        for (const [commandName, commandData] of Object.entries(commands as BaseDiscordCommandDefinitions)) {
                            const clone = cloneDeep(commandData);
                            /* eslint-disable @typescript-eslint/no-explicit-any */
                            (clone as any as BaseDiscordCommandData).originalName = commandName;
                            DiscordCommands[commandName] = clone as any as BaseDiscordCommandData;
                            if (commandData.aliases)
                                for (const alias of commandData.aliases) {
                                    const cloneNeo = commandData;
                                    (cloneNeo as any as BaseDiscordCommandData).originalName = commandName;
                                    DiscordCommands[alias] = cloneNeo as any as BaseDiscordCommandData;
                                }
                            /* eslint-enable */
                        }
                    })
                    .catch(console.error);
            })
        );
    }

    getCommandData(name: string): BaseDiscordCommandData | null {
        name = Tools.toId(name);
        const command = DiscordCommands[name];
        if (!command) return null;
        else return cloneDeep(command);
    }

    getCommandGuide(name: string): BaseDiscordCommandGuide | null {
        const command = this.getCommandData(name);
        if (!command) return null;
        const guide = (({ run, ...data }) => data)(command); // eslint-disable-line @typescript-eslint/no-unused-vars
        return guide;
    }

    getResolvableCommandData(name: string): ApplicationCommandData | null {
        const command = this.getCommandData(name);
        if (!command) return null;
        name = Tools.toId(name);
        if (command.guildOnly) command.resolvable.dmPermission = false;
        if (command.resolvable.name !== name) command.resolvable.name = name;
        return command.resolvable;
    }

    parse(interaction: ChatInputCommandInteraction): boolean {
        if (!interaction.channel) {
            void interaction.reply({
                content: "This interaction does not have a data of TextChannel; Please report this to developer",
                ephemeral: true,
            });
            return false;
        }

        const cmd = this.getCommandData(interaction.commandName);
        if (!cmd) return false;

        let result: boolean = true;

        try {
            new DiscordCommandContext(cmd.originalName, interaction).run();
        } catch (e: unknown) {
            console.error(e);
            result = false;
        }

        return result;
    }
}

export class DiscordCommandContext {
    originalName: string;
    interaction: ChatInputCommandInteraction;

    constructor(originalName: string, interaction: ChatInputCommandInteraction) {
        this.originalName = originalName;
        this.interaction = interaction;
    }

    run(): void {
        /* eslint-disable @typescript-eslint/no-non-null-assertion */
        const command = DiscordCommands[this.originalName];
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
        if (!this.interaction.channel) return;
        void this.interaction.channel.send(this.checkChat(content));
    }

    sayError(err: DiscordCommandErrorInputType, options: InteractionReplyOptions, ...args: string[]): void {
        if (!discord.user?.username) return;
        let content: string;

        switch (err) {
            case "INVALID_CHANNEL": {
                if (args[0]) content = args[0] + " is not one of " + discord.user.username + "'s channel.";
                else content = "You must specifiy at least one of " + discord.user.username + "'s chennel.";
                break;
            }

            case "INVALID_GUILD": {
                if (args[0]) content = args[0] + " is not one of " + discord.user.username + "'s guild.";
                else content = "You must specifiy at least one of " + discord.user.username + "'s guild.";
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
