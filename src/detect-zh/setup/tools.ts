"use strict";

import { exec as execShell, execSync as execShellSync } from "child_process";

import type { ChildProcess, ExecException, ExecOptions, ExecSyncOptions, ExecSyncOptionsWithStringEncoding } from "child_process";
import type { ObjectEncodingOptions } from "fs";

export function exec(
    cmd: string,
    options?: ObjectEncodingOptions | ExecOptions,
    callback?: (error: ExecException | null, stdout: string, stderr: string) => void
): ChildProcess {
    // @ts-expect-error options must be assignable
    return execShell(cmd, Object.assign({ encoding: "utf-8" }, options ?? {}), callback);
}

export function execSync(cmd: string, options?: ExecSyncOptions | ExecSyncOptionsWithStringEncoding): string {
    // @ts-expect-error return type should be string
    return execShellSync(cmd, Object.assign({ encoding: "utf-8", stdio: "inherit" }, options ?? {}));
}
