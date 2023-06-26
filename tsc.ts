"use strict";

import * as path from "node:path";

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
        ts.sys.fileExists.bind(ts.sys),
        toPath(argv.reverse().find((a) => a.startsWith(tsconfigFlag)) ?? "").replace(tsconfigFlag, "")
    );

    if (!tsconfigFileName) throw new Error("TSConfig file not found");

    // eslint-disable-next-line prefer-const
    let { config: tsconfig, error }: { config: tsconfigOptions; error: ts.Diagnostic } = ts.readConfigFile(
        path.resolve(__dirname, tsconfigFileName),
        ts.sys.readFile.bind(ts.sys)
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
    // @ts-expect-error incremental does not exist on ts.CompilerOptions
    tsconfig.incremental = false;

    return tsconfig;
}

function getBaseTSConfigFile(tsconfig: tsconfigOptions): tsconfigOptions {
    if (tsconfig.extends) {
        const { config: baseTSConfig, error }: { config: tsconfigOptions; error: ts.Diagnostic } = ts.readConfigFile(
            path.resolve(__dirname, tsconfig.extends),
            ts.sys.readFile.bind(ts.sys)
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
    let errorsWithoutFile = 0;
    allDiagnostics.reduce((previousDiagnosticFileName: string, diagnostic, index) => {
        if (diagnostic.file) {
            let errorText = "";
            errorText += "\x1b[36m" + removeResolvedPath(diagnostic.file.fileName);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            let { line, character } = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start!);
            line++;
            character++;
            if (!(diagnostic.file.fileName in errorsFiles)) {
                errorsFiles[diagnostic.file.fileName] = {
                    numbers: 1,
                    starting: line,
                };
            } else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                errorsFiles[diagnostic.file.fileName]!.numbers++;
            }
            errorText += "\x1b[37m:\x1b[33m" + line + "\x1b[37m:\x1b[33m" + character;
            errorText += "\x1b[37m - ";
            errorText += "\x1b[31merror ";
            errorText +=
                "\x1b[39m\x1b[2mTS" + diagnostic.code + ": \x1b[0m" + ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
            errorText += "\n\n";
            errorText += "\x1b[47m\x1b[30m" + line;
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
            if (index + 1 < allDiagnostics.length) console.log();
            errorsWithoutFile++;
            return "";
        }
    }, "");
    process.stdout.write("\x1b[0m");

    if (allDiagnostics.length === 1 && allDiagnostics.length !== errorsWithoutFile) {
        console.log();
        console.error(
            "Found 1 error in " +
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                removeResolvedPath(allDiagnostics[0]!.file!.fileName) +
                "\x1b[2m" +
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                errorsFiles[allDiagnostics[0]!.file!.fileName]!.starting
        );
    } else if (areAllErrorsOnSameFile && allDiagnostics.length > 1 && allDiagnostics.length !== errorsWithoutFile) {
        console.log();
        console.error(
            "Found " + (allDiagnostics.length - errorsWithoutFile) + " errors in the same file, starting at:",
            /* eslint-disable @typescript-eslint/no-non-null-assertion */
            removeResolvedPath(Object.keys(errorsFiles)[0]!) + "\x1b[2m:" + errorsFiles[Object.keys(errorsFiles)[0]!]!.starting
            /* eslint-enable */
        );
    } else if (allDiagnostics.length !== 0 && allDiagnostics.length !== errorsWithoutFile) {
        const maxError = Object.values(errorsFiles).reduce((p, c) => Math.max(c.numbers, p), 0);
        console.log();
        let message =
            "Found " +
            (allDiagnostics.length - errorsWithoutFile) +
            " errors in " +
            Object.keys(errorsFiles).length +
            " files.\n\nErrors  Files\n";

        let remainingFiles = Object.keys(errorsFiles).length;
        for (const file in errorsFiles) {
            message +=
                "\x1b[0m" +
                " ".repeat(5 - maxError) +
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                errorsFiles[file]!.numbers +
                "  " +
                removeResolvedPath(file) +
                "\x1b[2m:" +
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
