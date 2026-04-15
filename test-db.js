import { pool } from "./src/app/db/pool.js"; // adjust path if needed

async function test() {
  try {
    const res = await pool.query("SELECT * FROM seats LIMIT 5;");
    console.log("Connected! Sample rows:", res.rows);
  } catch (err) {
    console.error("DB connection failed:", err);
  } finally {
    pool.end();
  }
}

test();
