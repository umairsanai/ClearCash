import pool from "./database.js";

export const INT_MAX = 2147483647;

export const wait = (seconds) => new Promise((res) => setTimeout(res, seconds*1000));

export const isString = (str) => Object.prototype.toString.call(str) === '[object String]' && (str instanceof String || typeof str === 'string');

export const extractDate = (date) => date.toISOString().split("T")[0];

export const initialize = () => {
    process.env.MODE = process.env.MODE.trim();
    process.env.DATABASE_USERNAME = process.env.DATABASE_USERNAME.trim();
    process.env.DATABASE_PASSWORD = process.env.DATABASE_PASSWORD.trim();  
}
export const formatColumnName = (name) => name.replaceAll(" ", "_").toLowerCase();

export const gracefulShutdown = (server) => {
    return async () => {
        try {
            server.close();
            await pool.end();
            console.log("Gracefully shutting down....");        
        } catch (err) {
            console.log("Ungracefully shutting down....");
            process.exit(-1);
        }
    }
}    
