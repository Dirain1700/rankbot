"use strict";

import { time, PermissionsBitField } from "discord.js";

import type { BaseDiscordCommandDefinitions } from "../../../../types/commands";

export const commands: BaseDiscordCommandDefinitions = {
    ban: {
        run(): void {
            if (
                !this.interaction.inCachedGuild() ||
                !this.interaction.channel ||
                !this.interaction.guild ||
                !this.interaction.memberPermissions.has(PermissionsBitField.Flags.BanMembers)
            ) {
                return void this.sayError("PERMISSION_DENIED", {});
            }

            const targetMember = this.interaction.options.getMember("user");
            if (
                !targetMember ||
                !this.interaction.guild ||
                (this.interaction.guild.ownerId !== this.interaction.user.id &&
                    targetMember.roles.highest.comparePositionTo(this.interaction.member.roles.highest) >= 0)
            ) {
                return void this.interaction.reply({ content: "Error: You cannot BAN user higer role have.", ephemeral: true });
            }

            const reasons = this.interaction.options.getString("reason", true);
            this.interaction.guild.bans
                .create(targetMember, {
                    reason: Tools.generateModlog(this.interaction.user, targetMember.user, "BAN", reasons),
                    deleteMessageSeconds: 604800,
                })
                .then(() => {
                    void this.interaction.reply({
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        content: `${time(new Date(), "T")} ${targetMember.user.tag} was banned from ${this.interaction.guild!.name} by ${
                            this.interaction.user.tag
                        }.${reasons ? " (" + reasons + ")" : ""}`,
                        ephemeral: false,
                    });
                    void targetMember.user.send(
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        `${time(new Date(), "T")} You (${targetMember.user.tag}) were banned from ${this.interaction.guild!.name} by ${
                            this.interaction.user.tag
                        }.${reasons ? " (" + reasons + ")" : ""}`
                    );
                })
                .catch(
                    (e: unknown) =>
                        void this.interaction.reply(`Error: failed to ban ${targetMember.user.tag}.\nReason: ${(e as Error).toString()}`)
                );
        },
        guildOnly: true,
        resolvable: {
            name: "ban",
            description: "Ban a user",
            options: [
                {
                    type: 6,
                    name: "user",
                    description: "A user who deserves to get Banned",
                    required: true,
                },
                {
                    type: 3,
                    name: "reason",
                    description: "reason",
                    required: true,
                },
            ],
        },
    },
    forceban: {
        async run(): Promise<void> {
            if (!Config.admin.includes(this.interaction.user.id)) return void this.sayError("PERMISSION_DENIED", {});

            if (!this.interaction.guild || !this.interaction.inCachedGuild() || this.interaction.channel?.isDMBased()) {
                return void this.interaction.reply({
                    content: "The guild was not found; Please report this to depeloper.",
                    ephemeral: true,
                });
            }

            const targetID = this.interaction.options.getString("user", true);
            const targetUser = await BotClient.disc.users.fetch(targetID);
            const reasons = this.interaction.options.getString("reason", true);

            /* eslint-disable @typescript-eslint/no-non-null-assertion */
            this.interaction.guild.bans
                .create(targetUser, {
                    deleteMessageSeconds: 604800,
                    reason: Tools.generateModlog(this.interaction.user, targetUser, "FORCEBAN", reasons),
                })
                .then(() => {
                    void this.interaction.reply({
                        content: `${time(new Date(), "T")} ${targetUser.tag} was force-banned from ${this.interaction.guild!.name} by ${
                            this.interaction.user.tag
                        }.(${reasons})`,
                        ephemeral: false,
                    });
                    void targetUser.send(
                        `${time(new Date(), "T")} You (${targetUser.tag}) were banned from ${this.interaction.guild!.name} by ${
                            this.interaction.user.tag
                        }.(${reasons})`
                    );
                })
                .catch(
                    (e: unknown) =>
                        void this.interaction.reply(`Error: failed to ban ${targetUser.tag}.\nReason: ${(e as Error).toString()}`)
                );
            /* eslint-enable */
        },
        guildOnly: true,
        resolvable: {
            name: "forceban",
            description: "Ban a user forcibly",
            options: [
                {
                    type: 3,
                    name: "user",
                    description: "UserID whom deserved to get banned",
                    required: true,
                },
                {
                    type: 3,
                    name: "reason",
                    description: "reason",
                    required: true,
                },
            ],
        },
    },
    unban: {
        async run(): Promise<void> {
            if (
                !this.interaction.guild ||
                !this.interaction.memberPermissions ||
                !this.interaction.memberPermissions.has(PermissionsBitField.Flags.BanMembers)
            )
                return void this.sayError("PERMISSION_DENIED", {});

            const targetID = this.interaction.options.getString("userid", true);
            const targetUser = await BotClient.disc.users.fetch(targetID);
            const reasons = this.interaction.options.getString("reason");
            this.interaction.guild.bans
                .remove(targetUser, Tools.generateModlog(this.interaction.user, targetUser, "UNBAN", reasons))
                .then(() => {
                    void this.interaction.reply({
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        content: `${time(new Date(), "T")} ${targetUser.tag} was unbanned from ${this.interaction.guild!.name} by ${
                            this.interaction.user.tag
                        }.${reasons ? " (" + reasons + ")" : ""}`,
                        ephemeral: false,
                    });
                })
                .catch(
                    (e: unknown) =>
                        void this.interaction.reply(`Error: failed to unban ${targetUser.tag}.\nReason: ${(e as Error).toString()}`)
                );
        },
        guildOnly: true,
        resolvable: {
            name: "unban",
            description: "Unban a user",
            options: [
                {
                    type: 3,
                    name: "user",
                    description: "A user ID who will be unbanned",
                    required: true,
                },
                {
                    type: 3,
                    name: "reason",
                    description: "reason",
                    required: true,
                },
            ],
        },
    },
    cleartext: {
        async run(): Promise<void> {
            if (
                !this.interaction.channel ||
                !this.interaction.memberPermissions ||
                !this.interaction.memberPermissions.has(PermissionsBitField.Flags.ManageMessages)
            ) {
                return void this.sayError("PERMISSION_DENIED", {});
            }

            if (this.interaction.channel.isDMBased()) return;

            const targetCount = this.interaction.options.getInteger("lines") ?? 1;
            const targetUser = this.interaction.options.getUser("user", true);
            const messages = await this.interaction.channel.messages
                .fetch({ limit: 100 })
                .then((m) => m.filter((msg) => msg.author.id === targetUser.id).first(targetCount));

            const log = `${time(new Date(), "T")} ${targetCount} of ${targetUser.tag}'s messages were cleard from ${
                this.interaction.channel.name
            } by ${this.interaction.user.tag}.`;

            this.interaction.channel
                .bulkDelete(messages)
                .then(
                    () =>
                        void this.interaction.reply({
                            content: log,
                            ephemeral: true,
                        })
                )
                .catch(() => {
                    const deleteMessages = messages.map((m) => m.delete());
                    Promise.all(deleteMessages)
                        .then(() => {
                            void this.interaction.reply({
                                content: log,
                                ephemeral: true,
                            });
                        })
                        .catch(() => {
                            void this.interaction.reply({
                                content: "Error: Couldn't delete messages.",
                                ephemeral: true,
                            });
                        });
                });
        },
        guildOnly: true,
        aliases: ["hidetext"],
        resolvable: {
            name: "cleartext",
            description: "Delete messages from a specified user",
            options: [
                {
                    type: 6,
                    name: "user",
                    description: "A user who deserves hidetext",
                    required: true,
                },
                {
                    type: 4,
                    name: "lines",
                    description: "The number of messages which will be deleted",
                    required: false,
                    minValue: 1,
                    maxValue: 100,
                },
            ],
        },
    },
    forcecleartext: {
        async run(): Promise<void> {
            if (
                !this.interaction.channel ||
                !this.interaction.memberPermissions ||
                !this.interaction.memberPermissions.has(PermissionsBitField.Flags.ManageMessages)
            )
                return void this.sayError("PERMISSION_DENIED", {});
            if (this.interaction.channel.isDMBased()) return;

            const targetID = this.interaction.options.getString("userid", true);
            const targetCount = this.interaction.options?.getInteger("lines") ?? 1;
            const targetUser = await BotClient.disc.users.fetch(targetID);

            const messages = await this.interaction.channel.messages
                .fetch({ limit: 100 })
                .then((m) => m.filter((msg) => msg.author.id == targetID).first(targetCount));

            const log = `${time(new Date(), "T")} ${targetCount} of ${targetUser.tag}'s messages were cleard from ${
                this.interaction.channel.name
            } by ${this.interaction.user.tag}.`;

            this.interaction.channel
                .bulkDelete(messages)
                .then(() =>
                    this.interaction.reply({
                        content: log,
                        ephemeral: false,
                    })
                )
                .catch(() => {
                    Promise.all(messages.map((m) => m.delete()))
                        .then(() => {
                            void this.interaction.reply({
                                content: log,
                                ephemeral: false,
                            });
                        })
                        .catch(() => {
                            void this.interaction.reply({
                                content: "Error: Couldn't delete messages.",
                                ephemeral: true,
                            });
                        });
                });
        },
        guildOnly: true,
        resolvable: {
            name: "forcecleartext",
            description: "Delete messages from a specified user forcibly",
            options: [
                {
                    type: 3,
                    name: "userid",
                    description: "UserID whom deserves hidetext",
                    required: true,
                },
                {
                    type: 4,
                    name: "lines",
                    description: "The number of messages which will be deleted",
                    required: false,
                    minValue: 1,
                    maxValue: 100,
                },
            ],
        },
    },
    kick: {
        run(): void {
            if (
                !this.interaction.guild ||
                !this.interaction.inCachedGuild() ||
                !this.interaction.channel ||
                this.interaction.channel.isDMBased()
            ) {
                return void this.interaction.reply({
                    content: "The guild was not found; Please report this to depeloper.",
                    ephemeral: true,
                });
            }
            if (!this.interaction.memberPermissions || !this.interaction.memberPermissions.has(PermissionsBitField.Flags.KickMembers))
                return void this.sayError("PERMISSION_DENIED", {});

            const targetMember = this.interaction.options.getMember("user");
            if (
                !targetMember ||
                (this.interaction.guild.ownerId !== this.interaction.user.id &&
                    targetMember.roles.highest.comparePositionTo(this.interaction.member.roles.highest) >= 0)
            )
                return void this.interaction.reply({ content: "Error: You cannot kick user higer role have.", ephemeral: true });

            const reasons = this.interaction.options.getString("reason", true);
            /* eslint-disable @typescript-eslint/no-non-null-assertion */
            this.interaction.guild.members
                .kick(targetMember, Tools.generateModlog(this.interaction.user, targetMember.user, "KICK", reasons))
                .then(() => {
                    void this.interaction.reply({
                        content: `${time(new Date(), "T")} ${targetMember.user.tag} was kicked from ${this.interaction.guild!.name} by ${
                            this.interaction.user.tag
                        }.(${reasons})`,
                        ephemeral: false,
                    });
                    void targetMember.user.send(
                        `${time(new Date(), "T")} You (${targetMember.user.tag}) were kicked from ${this.interaction.guild!.name} by ${
                            this.interaction.user.tag
                        }.(${reasons})`
                    );
                })
                /* eslint-enable */
                .catch(
                    (e: unknown) =>
                        void this.interaction.reply(`Error: failed to kick ${targetMember.user.tag}.\nReason: ${(e as Error).toString()}`)
                );
        },
        guildOnly: true,
        resolvable: {
            name: "kick",
            description: "Kick a user",
            options: [
                {
                    type: 6,
                    name: "user",
                    description: "A user who deserves get kicked",
                    required: true,
                },
                {
                    type: 3,
                    name: "reason",
                    description: "reason",
                    required: true,
                },
            ],
        },
    },
    mute: {
        run(): void {
            if (
                !this.interaction.guild ||
                !this.interaction.inCachedGuild() ||
                !this.interaction.channel ||
                this.interaction.channel.isDMBased()
            ) {
                return void this.interaction.reply({
                    content: "The guild was not found; Please report this to depeloper.",
                    ephemeral: true,
                });
            }
            if (!this.interaction.memberPermissions || !this.interaction.memberPermissions.has(PermissionsBitField.Flags.ModerateMembers))
                return void this.sayError("PERMISSION_DENIED", {});

            const targetMember = this.interaction.options.getMember("user");
            if (
                !targetMember ||
                (this.interaction.guild.ownerId !== this.interaction.user.id &&
                    targetMember.roles.highest.comparePositionTo(this.interaction.member.roles.highest) >= 0)
            )
                return void this.interaction.reply({ content: "Error: You cannot mute user higer role have.", ephemeral: true });

            const hour = this.interaction.options.getInteger("hours", false) ?? 0;
            const min = this.interaction.options.getInteger("minutes", true);
            const reasons = this.interaction.options.getString("reason");

            targetMember
                .timeout(
                    hour * 60 * 60 * 1000 + min * 60 * 1000 || null,
                    Tools.generateModlog(this.interaction.user, targetMember.user, "MUTE", reasons)
                )
                .then(() => {
                    let log;
                    if (hour === 0) {
                        if (min === 0) {
                            log = `${time(new Date(), "T")} ${targetMember.user.tag} was unmuted by ${this.interaction.user.tag}.${
                                reasons ? " (" + reasons + ")" : ""
                            }`;
                        }
                        log = `${time(new Date(), "T")} ${targetMember.user.tag} was muted for ${min}minutes by ${
                            this.interaction.user.tag
                        }.${reasons ? " (" + reasons + ")" : ""}`;
                    } else {
                        log = `${time(new Date(), "T")} ${targetMember.user.tag} was muted for ${hour} and ${min}minutes by ${
                            this.interaction.user.tag
                        }.${reasons ? " (" + reasons + ")" : ""}`;
                    }
                    void this.interaction.reply({ content: log, ephemeral: false });
                })
                .catch(
                    (e) =>
                        void this.interaction.reply(`Error: failed to mute ${targetMember.user.tag}.\nReason: ${(e as Error).toString()}`)
                );
        },
        guildOnly: true,
        resolvable: {
            name: "mute",
            description: "Mute a user for the time you typed. Leave blank to unmute",
            options: [
                {
                    type: 6,
                    name: "user",
                    description: "A user who deserves get muted",
                    required: true,
                },
                {
                    type: 4,
                    name: "hours",
                    description: "Hour. Range: 0 to 23",
                    required: true,
                    minValue: 0,
                    maxValue: 23,
                },
                {
                    type: 4,
                    name: "minutes",
                    description: "Minutes. Range: 0 to 60",
                    required: true,
                    minValue: 0,
                    maxValue: 60,
                },
                {
                    type: 3,
                    name: "reason",
                    description: "reason",
                    required: true,
                },
            ],
        },
    },
    unmute: {
        run(): void {
            if (
                !this.interaction.guild ||
                !this.interaction.inCachedGuild() ||
                !this.interaction.channel ||
                this.interaction.channel.isDMBased()
            ) {
                return void this.interaction.reply({
                    content: "The guild was not found; Please report this to depeloper.",
                    ephemeral: true,
                });
            }
            if (!this.interaction.memberPermissions || !this.interaction.memberPermissions.has(PermissionsBitField.Flags.ModerateMembers))
                return void this.sayError("PERMISSION_DENIED", {});

            const targetMember = this.interaction.options.getMember("user");
            if (
                !targetMember ||
                (this.interaction.guild.ownerId !== this.interaction.user.id &&
                    targetMember.roles.highest.comparePositionTo(this.interaction.member.roles.highest) >= 0)
            )
                return void this.interaction.reply({ content: "Error: You cannot unmute user higer role have.", ephemeral: true });

            const reason = this.interaction.options.getString("reason");

            void targetMember.timeout(null, Tools.generateModlog(this.interaction.user, targetMember.user, "UNMUTE", reason)).then(() => {
                void this.interaction.reply({
                    content: `${time(new Date(), "T")} ${targetMember.user.tag} was unmuted by ${this.interaction.user.tag}.${
                        reason ? " (" + reason + ")" : ""
                    }`,
                    ephemeral: false,
                });
            });
        },
        guildOnly: true,
        resolvable: {
            name: "unmute",
            description: "Unmute a user",
            options: [
                {
                    type: 6,
                    name: "user",
                    description: "A user who will be unmuted",
                    required: true,
                },
                {
                    type: 3,
                    name: "reason",
                    description: "reason",
                    required: false,
                },
            ],
        },
    },
};
