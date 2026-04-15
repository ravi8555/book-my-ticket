import 'dotenv/config';
import pg from "pg";

export const pool = new pg.Pool({
  // host: "localhost",
  // port: 5433,
  // user: "postgres",
  // password: "postgres",
  // database: "book_seats_db",
  // max: 20,
  // connectionTimeoutMillis: 0,
  // idleTimeoutMillis: 0,
  connectionString: process.env.DATABASE_URL, // use Neon string from .env
  ssl: {
    rejectUnauthorized: false, // required for Neon SSL
  },
});