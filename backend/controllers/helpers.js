import pool from "../database.js";

export const INT_MAX = 2147483647;

export const wait = (seconds) => new Promise((res) => setTimeout(res, seconds*1000));

export const isInteger = (num) => Number.isInteger(num);
export const isString = (str) => Object.prototype.toString.call(str) === '[object String]' && (str instanceof String || typeof str === 'string');

export function formatDate(date) {
    return new Intl.DateTimeFormat('fr-CA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(date);
}

export const formatColumnName = (name) => name.replaceAll(" ", "_").toLowerCase();

export const gracefulShutdown = (server) => {
    return async () => {
        try {
            server.close();
            if (!pool.ended && !pool.ending)
                await pool.end();
            console.log("Gracefully shutting down....");        
        } catch (err) {
            console.log("Ungracefully shutting down....");
            process.exit(-1);
        }
    }
}

export const getHealth = (req, res, next) => {
    res.status(200).json({
        status: "success",
        data: {
            service: "clearcash-api",
            uptimeSeconds: Math.floor(process.uptime())
        }
    });
};

export const unhandledRequestHandler = (req, res, next) => {
    res.status(400).json({
        status: "fail",
        message: "No such route exists!"
    });
}