import bodyParser from "body-parser";
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

const pool = new Pool({
  user: Buffer.from(String(DB_USER), "base64").toString("ascii"),
  host: DB_HOST,
  database: Buffer.from(String(DB_NAME), "base64").toString("ascii"),
  password: Buffer.from(String(DB_PASSWORD), "base64").toString("ascii"),
  port: Number(DB_PORT),
});

app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (_req: Request, res: Response) => {
  res.send("GET ms. Hello World!");
});

app.get("/getData", async (_req: Request, res: Response) => {
  try {
    // Run the select query using the pool
    const queryResult = await pool.query("SELECT * FROM todos");

    // Send the query results as JSON
    res.json(queryResult.rows);
  } catch (error) {
    console.error("Error running query", error);
    res.status(500).json({
      error: error,
      env: {
        DB_USER: DB_USER,
        DB_HOST: DB_HOST,
        DB_NAME: DB_NAME,
        DB_PASSWORD: DB_PASSWORD,
        DB_PORT: DB_PORT,
      },
    });
  }
});

app.use(function (_req: Request, _res: Response, next: NextFunction) {
  next(createError(404));
});

app.listen(PORT, () => console.log(`Running on ${PORT}`));
