///<reference types="../types/global"/>

import { setupErrorLogger, setupGlobal, listenShutdown } from "./setup";

setupErrorLogger();
setupGlobal();
listenShutdown();

void Discord.login(process.env.DISCORD as string);
PS.connect();
