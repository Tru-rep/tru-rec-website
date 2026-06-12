import { Router } from "express";
import { store } from "../db/data.js";
import { BUS46_ROWS, BUS46_TOTAL_SEATS } from "../utils/busLayout.js";

const router = Router();

const GLOBAL_WINDOW_MS = Number(process.env.PUBLIC_GLOBAL_WINDOW_MS || 60_000);
const GLOBAL_MAX = Number(process.env.PUBLIC_GLOBAL_MAX || 120);
const GLOBAL_LIMIT_DISABLED = String(process.env.PUBLIC_GLOBAL_LIMIT_DISABLED || "") === "1";
const globalHits = new Map();

function clientKey(req) {
  return (req.ip || req.socket?.remoteAddress || "unknown").toString();
}

function checkPublicGlobalLimit(req, res, next) {
  if (GLOBAL_LIMIT_DISABLED) return next();
  const key = clientKey(req);
  const now = Date.now();
  const arr = (globalHits.get(key) || []).filter((t) => now - t < GLOBAL_WINDOW_MS);
  if (arr.length >= GLOBAL_MAX) {
    return res.status(429).json({ error: "محاولات كثيرة، حاول بعد قليل" });
  }
  arr.push(now);
  globalHits.set(key, arr);
  return next();
}

router.use(checkPublicGlobalLimit);

const PUBLIC_MAX_SERVICE_DAY_OFFSET = Number(process.env.PUBLIC_MAX_SERVICE_DAY_OFFSET ?? 6);

function parsePublicServiceDay(req) {
  const raw = typeof req.query?.date === "string" ? req.query.date.trim() : "";
  if (!raw) return { ok: true, ymd: null };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return { ok: false, error: "تاريخ غير صالح" };
  return { ok: true, ymd: raw };
}

router.get("/config", async (_req, res, next) => {
  try {
    const service_today = await store.getServiceToday();
    const maxOff = Number.isFinite(PUBLIC_MAX_SERVICE_DAY_OFFSET) ? PUBLIC_MAX_SERVICE_DAY_OFFSET : 6;
    const raw = String(process.env.WHATSAPP_NUMBER || "").replace(/[^\d]/g, "");
    return res.json({
      whatsapp: raw,
      service_today,
      max_service_day_offset: maxOff,
    });
  } catch (err) {
    return next(err);
  }
});

router.get("/buses/active", async (req, res, next) => {
  try {
    const parsed = parsePublicServiceDay(req);
    if (!parsed.ok) return res.status(400).json({ error: parsed.error });

    const maxOff = Number.isFinite(PUBLIC_MAX_SERVICE_DAY_OFFSET) ? PUBLIC_MAX_SERVICE_DAY_OFFSET : 6;
    const rows = await store.listPublicActiveBuses(parsed.ymd, maxOff);
    if (rows === null) {
      return res.status(400).json({ error: "التاريخ خارج نطاق الحجز (اليوم وحتى أسبوع قادم)" });
    }
    return res.json({ buses: rows });
  } catch (err) {
    return next(err);
  }
});

router.get("/buses/:id/seat-map", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });

    const parsed = parsePublicServiceDay(req);
    if (!parsed.ok) return res.status(400).json({ error: parsed.error });
    const maxOff = Number.isFinite(PUBLIC_MAX_SERVICE_DAY_OFFSET) ? PUBLIC_MAX_SERVICE_DAY_OFFSET : 6;

    const result = await store.getPublicBusSeatMap(id, parsed.ymd, maxOff);
    if (result?.error === "date") {
      return res.status(400).json({ error: "التاريخ خارج نطاق الحجز (اليوم وحتى أسبوع قادم)" });
    }
    if (!result) return res.status(404).json({ error: "الرحلة غير متاحة" });

    return res.json({
      bus_id: id,
      total_seats: result.total_seats || BUS46_TOTAL_SEATS,
      layout: "46",
      layout_rows: BUS46_ROWS,
      origin: result.origin,
      destination: result.destination,
      price: result.price,
      departure_time: result.departure_time,
      date: result.date,
      seats: result.seats,
    });
  } catch (err) {
    return next(err);
  }
});

const PUBLIC_RESERVE_DISABLED =
  "الحجز في النظام يتم من الموظف فقط. أرسل تفاصيلك على واتساب ليتم التأكيد.";

router.post("/bookings/reserve", (_req, res) =>
  res.status(403).json({ error: PUBLIC_RESERVE_DISABLED })
);
router.post("/bookings/reserve-bulk", (_req, res) =>
  res.status(403).json({ error: PUBLIC_RESERVE_DISABLED })
);

export default router;
