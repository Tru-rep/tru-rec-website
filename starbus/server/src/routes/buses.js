import { Router } from "express";
import { z } from "zod";
import { store } from "../db/data.js";
import { BUS46_ROWS, BUS46_TOTAL_SEATS } from "../utils/busLayout.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

const AUTH_ACTIVE_MAX_DAY_OFFSET = Number(process.env.PUBLIC_MAX_SERVICE_DAY_OFFSET ?? 6);

router.get("/active", async (req, res, next) => {
  try {
    const dateParam =
      typeof req.query?.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(req.query.date)
        ? req.query.date
        : null;
    const maxOff = Number.isFinite(AUTH_ACTIVE_MAX_DAY_OFFSET) ? AUTH_ACTIVE_MAX_DAY_OFFSET : 6;
    const rows = await store.listActiveBuses(req.user, dateParam, maxOff);
    if (rows?.error === "date") {
      return res.status(400).json({ error: "التاريخ خارج نطاق الحجز (اليوم وحتى أسبوع قادم)" });
    }
    return res.json({ buses: rows });
  } catch (err) {
    return next(err);
  }
});

router.get("/:id/seat-map", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });

    const result = await store.getBusSeatMap(req.user, id);
    if (!result) return res.status(404).json({ error: "Not found" });
    if (result.forbidden) return res.status(403).json({ error: "Forbidden" });

    return res.json({
      bus_id: id,
      total_seats: result.total_seats || BUS46_TOTAL_SEATS,
      layout: "46",
      layout_rows: BUS46_ROWS,
      origin: result.origin,
      destination: result.destination,
      seats: result.seats,
    });
  } catch (err) {
    return next(err);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const rows = await store.listAllBuses(req.user);
    return res.json({ buses: rows });
  } catch (err) {
    return next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });

    const bus = await store.getBus(req.user, id);
    if (!bus) return res.status(404).json({ error: "Not found" });
    if (bus.forbidden) return res.status(403).json({ error: "Forbidden" });
    return res.json({ bus });
  } catch (err) {
    return next(err);
  }
});

const createBusSchema = z.object({
  bus_owner_id: z.number().int().positive(),
  bus_number: z.string().min(1).max(50),
  total_seats: z.number().int().positive().max(999),
  departure_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  route_id: z.number().int().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(["scheduled", "departed", "cancelled", "sold_out"]).optional(),
});

router.post("/", requireRole(["admin", "superadmin"]), async (req, res, next) => {
  try {
    const body = createBusSchema.parse(req.body);
    const departureTime = body.departure_time.length === 5 ? `${body.departure_time}:00` : body.departure_time;
    const result = await store.createBus(req.user, { ...body, departure_time: departureTime });
    if (result.dup) return res.status(409).json({ error: "Bus already exists for that slot" });
    return res.status(201).json({ id: result.id });
  } catch (err) {
    return next(err);
  }
});

export default router;
