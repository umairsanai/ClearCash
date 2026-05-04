import dotenv from "dotenv";
dotenv.config({path: ".env"});

import app from "./app.js";
import { initialize, gracefulShutdown } from "./helpers.js";

const server = app.listen(process.env.PORT || 3000, process.env.SERVER_HOST || "0.0.0.0");

initialize();

process.on('SIGTERM', gracefulShutdown(server));
process.on('SIGINT', gracefulShutdown(server));