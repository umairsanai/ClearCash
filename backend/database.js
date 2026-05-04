import dotenv from "dotenv";
import { Pool, Client } from 'pg'

dotenv.config({path: "config.env"});


// LOCAL DATABASE

const config = {
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    database: process.env.DATABASE_NAME,
};

const pool = new Pool(config); 


/*

CLOUD DATABASE:

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: true
    },
}); 
    
*/

export default pool;