///<reference types="../types/global"/>

import { setupErrorLogger, setupGlobal, listenShutdown } from "./setup";

setupErrorLogger();
setupGlobal();
listenShutdown();

void BotClient.disc.login(process.env.DISCORD as string);
BotClient.ps.connect();
