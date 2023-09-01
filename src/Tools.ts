"use strict";

import { exec as execShell, execSync as execShellSync } from "node:child_process";
import { inspect } from "node:util";

import { Tools as PSTools } from "./ps/client/src";

import type { User, Snowflake } from "discord.js";

import type { ChildProcess, ExecException, ExecOptions, ExecSyncOptions, ExecSyncOptionsWithStringEncoding } from "node:child_process";
import type { ObjectEncodingOptions } from "node:fs";

import type { ModlogType } from "../types/index";

export class Tools extends PSTools {
    static exec(
        cmd: string,
        options?: ObjectEncodingOptions | ExecOptions,
        callback?: (error: ExecException | null, stdout: string, stderr: string) => void
    ): ChildProcess {
        // @ts-expect-error options must be assignable
        return execShell(cmd, Object.assign({ encoding: "utf-8" }, options ?? {}), callback);
    }

    static execSync(cmd: string, options?: ExecSyncOptions | ExecSyncOptionsWithStringEncoding): string {
        // @ts-expect-error return type should be string
        return execShellSync(cmd, Object.assign({ encoding: "utf-8", stdio: "inherit" }, options ?? {}));
    }

    static override toString(input: unknown, depth?: number): string {
        if (!input) {
            if (arguments.length === 0) return super.toString();
            if (input === null) return "null";
            if (input === undefined) return "undefined";
        }
        depth ??= 0;
        const inputType = typeof input;
        switch (typeof input) {
            case "undefined": {
                return "undefined";
            }
            case "string": {
                // eslint-disable-next-line quotes
                if (!input) return '""';
                else return input;
            }
            case "number":
            case "symbol":
            case "boolean": {
                return input.toString();
            }
            case "bigint": {
                return input.toString() + "n";
            }
            case "function": {
                let type = input.toString().split(" ")[0];
                if (!type || type.endsWith(")") || type.endsWith(",")) type = "function";
                const { name } = input;
                if (type === "function") return "[" + type + " " + (name || "anonymous") + "]";
                return "[" + type + " " + (name || "anonymous") + "]";
            }
            case "object": {
                if (input === null) return "null";
                if (input === undefined) return "undefined";
                if (Array.isArray(input)) {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    return "[" + input.map((e) => this.toString(e, depth! + 1)).join(", ") + "]";
                }
                return Tools.trim(inspect(input, { depth: depth ?? 1 }).replaceAll("\n", ""));
            }
            default:
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                throw new Error("Type " + (inputType as any as never) + " does not satisfy any types");
        }
    }

    static generateModlog(staff: User, targetUser: User, action: ModlogType, reason: string | null | undefined): string {
        let log = action + " [" + targetUser.tag + "] by " + staff.tag;
        if (reason) log += " : " + reason;

        return log;
    }

    static isSnowflake(input: string): input is Snowflake {
        return input.split("").every((s) => /\d/.test(s)) && input.length >= 17;
    }

    /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access */
    static isPromiseFulfilled<T>(result: PromiseSettledResult<T>): result is PromiseFulfilledResult<T> {
        return (result as any)?.status === "fulfilled";
    }

    static isPromiseRejected<T>(result: PromiseSettledResult<T>): result is PromiseRejectedResult {
        return (result as any)?.status === "rejected";
    }
    /* eslint-enable */

    static loadSubmodules(absolutePath: string): string[] {
        const paths: string[] = [];

        for (const submodule of fs.readdirSync(absolutePath)) {
            const stat = fs.statSync(path.join(absolutePath, submodule));
            if (stat.isFile()) {
                paths.push(path.join(absolutePath, submodule));
            } else {
                paths.push(...this.loadSubmodules(path.join(absolutePath, submodule)));
            }
        }
        return paths;
    }
}
