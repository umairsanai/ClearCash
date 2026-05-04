import dotenv from "dotenv";
dotenv.config({path: ".env"});

import app from "./app.js";
import { initialize, gracefulShutdown } from "./helpers.js";

const server = app.listen(process.env.SERVER_PORT, process.env.SERVER_HOST, () => {
   console.log("Server started...."); 
});

initialize();


process.on('SIGTERM', gracefulShutdown(server));
process.on('SIGINT', gracefulShutdown(server));