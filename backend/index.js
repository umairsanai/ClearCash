import dotenv from "dotenv";
dotenv.config({path: ".env"});
console.clear();

import app from "./app.js";
import { initialize, gracefulShutdown } from "./helpers.js";

const server = app.listen(process.env.PORT || 3000, "0.0.0.0", () => {
    console.log(`Server running on port ${process.env.PORT || 3000}.....`);    
});

initialize();

process.on('SIGTERM', gracefulShutdown(server));
process.on('SIGINT', gracefulShutdown(server));