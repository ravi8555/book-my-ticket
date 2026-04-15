//  CREATE TABLE seats (
//      id SERIAL PRIMARY KEY,
//      name VARCHAR(255),
//      isbooked INT DEFAULT 0
//  );
// INSERT INTO seats (isbooked)
// SELECT 0 FROM generate_series(1, 20);

import express from "express";
import cookieParser from "cookie-parser";
import pg from "pg";
import { dirname } from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import { pool } from "./src/app/db/pool.js";
import { authRouter } from "./src/app/modules/auth/routes/auth.routes.js";
import { authenticationMiddleware } from "./src/app/modules/auth/middleware/auth.middleware.js";  // ✅ Add this
import 'dotenv/config'
const __dirname = dirname(fileURLToPath(import.meta.url));
const port = process.env.PORT || 8080;

// Equivalent to mongoose connection
// Pool is nothing but group of connections
// If you pick one connection out of the pool and release it
// the pooler will keep that connection open for sometime to other clients to reuse

/*
Due to sharing the pool between book seat and auth logic created circular dependancy .
./src/app/db/pool.js
hence pool connection put on the seperate files to make connection with auth, seat booking and future other modules
*/

const app = express();
// //Ravindra edited code start here for auth
const isProduction = process.env.NODE_ENV === 'production';
const corsOptions = {
  origin: isProduction 
    ? 'https://book-my-ticket-blond.vercel.app'
    : 'http://localhost:8080',
  credentials: true
};

app.use(cors(corsOptions));

// app.use(cors({
//   origin: 'https://book-my-ticket-blond.vercel.app',
//   credentials: true  
// }));
app.use(express.json());  
app.use(cookieParser()); 
app.use('/auth', authRouter);

app.get("/reset-password", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});
// //Ravindra End code end here for auth
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/seats", async (req, res) => {
  const result = await pool.query("select * from seats");
  res.send(result.rows);
});

//book a seat give the seatId and your name
// ✅ PROTECTED booking endpoint - requires authentication
app.put("/:id/:name", authenticationMiddleware, async (req, res) => {
  try {
    console.log("Authenticated user:", req.user);
    const userId = req.user.id;
    const userEmail = req.user.email;
    const id = req.params.id;
    const name = req.params.name;
    // payment integration should be here
    // verify payment
    
    const conn = await pool.connect();// pick a connection from the pool
    //begin transaction
    // KEEP THE TRANSACTION AS SMALL AS POSSIBLE
    await conn.query("BEGIN");
    //getting the row to make sure it is not booked
    /// $1 is a variable which we are passing in the array as the second parameter of query function,
    // Why do we use $1? -> this is to avoid SQL INJECTION
    // (If you do ${id} directly in the query string,
    // then it can be manipulated by the user to execute malicious SQL code)
    const sql = "SELECT * FROM seats where id = $1 and isbooked = 0 FOR UPDATE";
    const result = await conn.query(sql, [id]);
    
//if no rows found then the operation should fail can't book
    // This shows we Do not have the current seat available for booking
    if (result.rowCount === 0) {
      await conn.query("ROLLBACK");
      conn.release();
      res.status(400).json({ error: "Seat already booked" });
      return;
    }
    
    //if we get the row, we are safe to update
    // ✅ Store who booked the seat (user ID from token)
    const sqlU = "UPDATE seats SET isbooked = 1, name = $2, booked_by_user_id = $3 WHERE id = $1";
    const updateResult = await conn.query(sqlU, [id, name, userId]);
    //end transaction by committing
    await conn.query("COMMIT");
    conn.release(); // release the connection back to the pool (so we do not keep the connection open unnecessarily)
    // res.send(updateResult);
    res.json({ success: true, message: "Seat booked successfully", bookedBy: userEmail });
  } catch (ex) {
    console.log(ex);
    res.status(500).json({ error: "Booking failed" });
  }
});
app.listen(port, () => console.log("Server starting on port: " + port));

