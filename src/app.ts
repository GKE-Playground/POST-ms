import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import createError from "http-errors";
import pg from "pg";
const { Pool } = pg;

import type {
  Express,
  NextFunction,
  Request,
  Response,
} from "express";

dotenv.config();

const app: Express = express();

const PORT = process.env["SERVICE_PORT"] || 3000;

const DB_USER = process.env["DB_USER"];
const DB_HOST = process.env["DB_HOST"];
const DB_NAME = process.env["DB_NAME"];
const DB_PASSWORD = process.env["DB_PASS"];
const DB_PORT = process.env["DB_PORT"];

let pool: pg.Pool;

if (process.env["NODE_ENV"] === "production") {
  pool = new Pool({
    user: Buffer.from(String(DB_USER), "base64").toString("ascii"),
    host: DB_HOST,
    database: Buffer.from(String(DB_NAME), "base64").toString("ascii"),
    password: Buffer.from(String(DB_PASSWORD), "base64").toString("ascii"),
    port: Number(DB_PORT),
  });
} else {
  pool = new Pool({
    user: DB_USER,
    host: DB_HOST,
    database: DB_NAME,
    password: DB_PASSWORD,
    port: Number(DB_PORT),
  });
}

app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.get("/", (_req: Request, res: Response) => {
  res.send("POST ms. Hello World!");
});

app.post("/postData", async (req: Request, res: Response) => {
  try {
    const queryResult = await pool.query(
      "INSERT INTO todos (todo) VALUES ($1) RETURNING *",
      [ req.body.todo ],
    );

    res.json(queryResult.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: error });
  }
  return null;
});

app.delete("/deleteData/:id", async (req: Request, res: Response) => {
  try {
    const queryResult = await pool.query(
      "DELETE FROM todos WHERE id = $1 RETURNING *",
      [ req.params["id"] ],
    );
    if (queryResult.rows.length === 0) {
      return res.status(404).json({ error: "Todo not found." });
    }

    res.json({ message: "Todo deleted successfully." });
  } catch (error) {
    return res.status(500).json({ error: error });
  }
  return null;
});

app.use(function (_req: Request, _res: Response, next: NextFunction) {
  //post
  next(createError(404));
});

app.listen(PORT, () => console.log(`Running on ${PORT}`));
