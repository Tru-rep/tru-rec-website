import mysql from "mysql2/promise";
import { resolveDbServiceTimezone } from "./serviceTimezone.js";

import { isDemoMode } from "./mode.js";

const onRender = process.env.RENDER === "true";
const dbHostRaw = (process.env.DB_HOST ?? "").trim();
if (!isDemoMode() && onRender && !dbHostRaw) {
  throw new Error(
    "DB_HOST is not set. On Render there is no local MySQL. In Environment → set DB_HOST, DB_USER, DB_PASSWORD, DB_NAME (and optional DB_PORT) to your cloud MySQL host (e.g. Railway, PlanetScale, Aiven)."
  );
}

const DB_HOST = dbHostRaw || "127.0.0.1";
const DB_PORT = (process.env.DB_PORT ?? "3306").trim() || "3306";
const DB_USER = (process.env.DB_USER ?? "root").trim() || "root";
const DB_PASSWORD = process.env.DB_PASSWORD ?? "";
const DB_NAME = (process.env.DB_NAME ?? "starbus").trim() || "starbus";

// Railway / many cloud proxies require TLS for remote clients (e.g. Render → Railway).
const isLocalDb = DB_HOST === "127.0.0.1" || DB_HOST === "localhost";
const tlsExplicitOff = process.env.DB_SSL === "0";
const tlsExplicitOn = process.env.DB_SSL === "1";
const useTls =
  !tlsExplicitOff &&
  (tlsExplicitOn || (onRender && !isLocalDb) || (!isLocalDb && !!dbHostRaw));

const poolConfig = {
  host: DB_HOST,
  port: Number(DB_PORT),
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  namedPlaceholders: true,
  timezone: "Z",
  dateStrings: true,
  supportBigNumbers: true,
  bigNumberStrings: true,
  connectTimeout: Number(process.env.DB_CONNECT_TIMEOUT_MS || 30_000),
  enableKeepAlive: true,
};

if (useTls) {
  poolConfig.ssl = { rejectUnauthorized: false };
}

export const pool = mysql.createPool(poolConfig);

const serviceTz = resolveDbServiceTimezone();

pool.on("connection", (conn) => {
  void applyServiceTimezone(conn);
});

async function applyServiceTimezone(conn) {
  if (!serviceTz) return;
  try {
    await conn.query("SET time_zone = ?", [serviceTz]);
  } catch (err) {
    console.error("[db] SET time_zone failed:", err?.message || err);
  }
}

function dbTargetLabel() {
  return `${DB_HOST}:${DB_PORT}/${DB_NAME} (ssl=${useTls ? "on" : "off"})`;
}

export async function pingDb() {
  const attempts = Number(process.env.DB_PING_RETRIES || 4);
  const delayMs = Number(process.env.DB_PING_RETRY_MS || 2500);
  let lastErr;

  for (let i = 1; i <= attempts; i++) {
    try {
      const conn = await pool.getConnection();
      try {
        await conn.ping();
        await applyServiceTimezone(conn);
      } finally {
        conn.release();
      }
      return;
    } catch (err) {
      lastErr = err;
      if (i < attempts) {
        console.error(
          `[db] ping attempt ${i}/${attempts} failed (${dbTargetLabel()}): ${err?.message || err}`
        );
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }
  }

  const hint = new Error(
    `Could not connect to MySQL at ${dbTargetLabel()} after ${attempts} attempts: ${lastErr?.message || lastErr}`
  );
  hint.cause = lastErr;
  throw hint;
}

