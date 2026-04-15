import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import *  as schema from  './schema.js'
import { pool } from "./pool.js";


export const db = drizzle(pool, {schema})

// // test connection
pool.on('connect', ()=>{
    console.log("Database Connected");    
})
