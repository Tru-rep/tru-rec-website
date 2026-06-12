import { Router } from "express";
import { z } from "zod";
import { store } from "../db/data.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);
router.use(requireRole(["admin", "superadmin"]));

const dailySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  bus_id: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().min(1).max(500).optional(),
  offset: z.coerce.number().int().min(0).max(50000).optional(),
});

const overviewSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  days: z.coerce.number().int().min(7).max(60).optional(),
});

router.get("/overview", async (req, res, next) => {
  try {
    const { date, days: daysParam } = overviewSchema.parse(req.query);
    const endDay = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : new Date().toISOString().slice(0, 10);
    const spanDays = Math.min(60, Math.max(7, daysParam ?? 14));
    const payload = await store.getOverview(req.user, endDay, spanDays);
    return res.json(payload);
  } catch (err) {
    return next(err);
  }
});

router.get("/daily", async (req, res, next) => {
  try {
    const { date, bus_id, limit = 200, offset = 0 } = dailySchema.parse(req.query);
    const day = date || new Date().toISOString().slice(0, 10);
    const lim = Math.min(500, Math.max(1, Number(limit)));
    const off = Math.min(50000, Math.max(0, Number(offset)));
    const payload = await store.getDaily(req.user, day, bus_id, lim, off);
    return res.json(payload);
  } catch (err) {
    return next(err);
  }
});

export default router;
