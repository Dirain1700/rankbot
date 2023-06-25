"use strict";

import * as fs from "node:fs";
import * as path from "node:path";

import { globSync } from "glob";
import { merge } from "lodash";
import * as ts from "typescript";

interface tsconfigOptions {
    include: string[];
    compilerOptions: ts.CompilerOptions;
    exclude?: string[];
    extends?: string;
    files?: string[];
}

const noEmitFlag = "noEmit";
const tsconfigFlag = "p";

function getTranspileOptions(args: string[]): tsconfigOptions {
    const argv = args.slice(2).join(" ").split("--");

    const tsconfigFileName = ts.findConfigFile(
        process.cwd(),
        ts.sys.fileExists,
        toPath(argv.reverse().find((a) => a.startsWith(tsconfigFlag)) ?? "").replace(tsconfigFlag, "")
    );

    if (!tsconfigFileName) throw new Error("TSConfig file not found");

    let { config: tsconfig, error }: { config: tsconfigOptions; error: ts.Diagnostic } = ts.readConfigFile(
        path.resolve(__dirname, tsconfigFileName),
        ts.sys.readFile
    ) as { config: tsconfigOptions; error: ts.Diagnostic };
    if (error) {
        console.error(error);
        process.exit(1);
    }
    if (tsconfig.extends) tsconfig = getBaseTSConfigFile(tsconfig);

    const emit = !argv.reverse().find((a) => a === noEmitFlag) && !tsconfig.compilerOptions.noEmit;

    if (!emit) {
        tsconfig.compilerOptions.noEmit = true;
        tsconfig.compilerOptions.emitDeclarationOnly = false;
    } else {
        if (!tsconfig.exclude) tsconfig.exclude = [];
        tsconfig.exclude.push("*/**/*-detect.ts");
    }

    return tsconfig;
}

function getBaseTSConfigFile(tsconfig: tsconfigOptions): tsconfigOptions {
    if (tsconfig.extends) {
        const { config: baseTSConfig, error }: { config: tsconfigOptions; error: ts.Diagnostic } = ts.readConfigFile(
            path.resolve(__dirname, tsconfig.extends),
            ts.sys.readFile
        ) as { config: tsconfigOptions; error: ts.Diagnostic };
        if (error) {
            console.error(error);
            process.exit(1);
        }
        if (baseTSConfig.extends) return getBaseTSConfigFile(merge(baseTSConfig, tsconfig, { extends: baseTSConfig.extends }));
        else return merge(baseTSConfig, tsconfig);
    } else return tsconfig;
}

function compile(fileNames: string[], options: ts.CompilerOptions): void {
    const program = ts.createProgram({ options, rootNames: fileNames });
    const emitResult = program.emit();

    const allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

    let areAllErrorsOnSameFile = true;

    interface fileErrors {
        numbers: number;
        starting: number;
    }
    const errorsFiles: { [k: string]: fileErrors } = {};
    allDiagnostics.reduce((previousDiagnosticFileName: string, diagnostic) => {
        if (diagnostic.file) {
            let errorText = "";
            errorText += "\x1b[36m" + removeResolvedPath(diagnostic.file.fileName);
            let { line, character } = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start!);
            line++;
            character++;
            if (!(diagnostic.file.fileName in errorsFiles)) {
                errorsFiles[diagnostic.file.fileName] = {
                    numbers: 1,
                    starting: line,
                };
            } else {
                errorsFiles[diagnostic.file.fileName]!.numbers++;
            }
            errorText += "\x1b[37m:\x1b[33m" + line + "\x1b[37m:\x1b[33m" + character;
            errorText += "\x1b[37m - ";
            errorText += "\x1b[31merror ";
            errorText +=
                "\x1b[39m\x1b[2mTS" + diagnostic.code + ": \x1b[0m" + ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
            errorText += "\n\n";
            errorText += "\x1b[47m\x1b[30m" + line;
            const wrongLine = diagnostic.file.text.split("\n")[line - 1]!;
            errorText += "\x1b[0m " + wrongLine + "\n";
            errorText += "\x1b[47m" + " ".repeat(line.toString().length) + "\x1b[49m " + " ".repeat(character - 1);
            errorText += "\x1b[31m" + "~".repeat(diagnostic.length || wrongLine.length);
            console.error(errorText);
            console.log("\x1b[0m");
            if (areAllErrorsOnSameFile) {
                if (previousDiagnosticFileName && previousDiagnosticFileName !== diagnostic.file.fileName) areAllErrorsOnSameFile = false;
            }
            return diagnostic.file.fileName;
        } else {
            console.log(ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"));
            return "";
        }
    }, "");
    process.stdout.write("\x1b[0m");

    if (allDiagnostics.length === 0) {
    } else if (allDiagnostics.length === 1) {
        console.log();
        console.error(
            "Found 1 error in " +
                removeResolvedPath(allDiagnostics[0]!.file!.fileName) +
                "\x1b[2m" +
                errorsFiles[allDiagnostics[0]!.file!.fileName]!.starting
        );
    } else if (areAllErrorsOnSameFile && allDiagnostics.length > 1) {
        console.log();
        console.error(
            "Found " + allDiagnostics.length + " errors in the same file, starting at:",
            removeResolvedPath(allDiagnostics[0]!.file!.fileName) + "\x1b[2m:" + errorsFiles[allDiagnostics[0]!.file!.fileName]!.starting
        );
    } else {
        console.log();
        let message = "Found " + allDiagnostics.length + " errors in " + Object.keys(errorsFiles).length + " files.\n\nErrors  Files\n";

        let remainingFiles = Object.keys(errorsFiles).length;
        for (const file in errorsFiles) {
            message +=
                "\x1b[0m" +
                " ".repeat(5) +
                errorsFiles[file]!.numbers +
                "  " +
                removeResolvedPath(file) +
                "\x1b[2m:" +
                errorsFiles[file]!.starting;
            if (remainingFiles > 1) {
                remainingFiles--;
                message += "\n";
            }
        }
        console.error(message);
    }
    process.stdout.write("\x1b[0m");

    if (emitResult.emitSkipped || allDiagnostics.length) process.exit(1);
    else process.exit(0);
}

function toPath(input: string): string {
    return input.replace(/[^a-z._-]/gim, "");
}

function removeResolvedPath(inputPath: string): string {
    return inputPath.replace(process.cwd() + "/", "");
}

const transpileOptions = getTranspileOptions(process.argv);
const { options, fileNames } = ts.parseJsonConfigFileContent(transpileOptions, ts.sys, process.cwd());

compile(fileNames, options);
