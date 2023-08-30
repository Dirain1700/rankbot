///<reference types="../types/global"/>

import { setupErrorLogger, setupGlobal, startServer } from "./setup";

setupErrorLogger();
setupGlobal();

void Discord.login(process.env.DISCORD as string);
PS.connect();

startServer();
