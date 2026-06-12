import { Router } from "express";
import { z } from "zod";
import { store } from "../db/data.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

const paymentSchema = z.enum(["paid", "unpaid", "half"]);
const WORKER_MAX_SEATS_PER_BOOKING = 20;

const reservePassengerContact = {
  passenger_name: z.string().trim().min(2).max(120),
  passenger_phone: z.string().trim().max(32).optional().or(z.literal("")),
  passenger_email: z.string().trim().max(255).optional().or(z.literal("")),
};

function addPassengerContactRefine(schema) {
  return schema.superRefine((data, ctx) => {
    const digits = String(data.passenger_phone || "").replace(/\D/g, "");
    const em = String(data.passenger_email || "").trim();
    if (digits.length >= 7) return;
    if (em.length > 0 && z.string().email().safeParse(em).success) return;
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "يجب إدخال هاتف (7 أرقام على الأقل) أو بريد صحيح",
      path: ["passenger_phone"],
    });
  });
}

const reserveSchema = addPassengerContactRefine(
  z.object({
    bus_id: z.coerce.number().int().positive(),
    seat_number: z.coerce.number().int().positive().max(999),
  }).extend(reservePassengerContact),
);

const fullSchema = z.object({
  bus_id: z.coerce.number().int().positive(),
  seat_number: z.coerce.number().int().positive().max(999),
  passenger_name: z.string().min(1).max(120),
  passenger_phone: z.string().min(3).max(32).optional().or(z.literal("")).optional(),
  passenger_email: z.string().email().max(255).optional().or(z.literal("")).optional(),
  from_location: z.string().min(1).max(120),
  to_location: z.string().min(1).max(120),
  booking_type: z.enum(["online", "booth"]),
  payment_status: paymentSchema.optional(),
});

const reserveBulkSchema = addPassengerContactRefine(
  z.object({
    bus_id: z.coerce.number().int().positive(),
    seat_numbers: z.array(z.coerce.number().int().positive().max(999)).min(1).max(WORKER_MAX_SEATS_PER_BOOKING),
  }).extend(reservePassengerContact),
);

const fullBulkSchema = z.object({
  bus_id: z.coerce.number().int().positive(),
  seat_numbers: z.array(z.coerce.number().int().positive().max(999)).min(1).max(WORKER_MAX_SEATS_PER_BOOKING),
  passenger_name: z.string().min(1).max(120),
  passenger_phone: z.string().min(3).max(32).optional().or(z.literal("")).optional(),
  passenger_email: z.string().email().max(255).optional().or(z.literal("")).optional(),
  from_location: z.string().min(1).max(120),
  to_location: z.string().min(1).max(120),
  booking_type: z.enum(["online", "booth"]),
  payment_status: paymentSchema.optional(),
});

function mapBookingResult(res, result, successStatus = 200) {
  if (!result) return res.status(404).json({ error: "Not found" });
  if (result.notFound) return res.status(404).json({ error: "Bus not found" });
  if (result.forbidden) return res.status(403).json({ error: "Forbidden" });
  if (result.status) return res.status(result.status).json({ error: result.message || "Forbidden" });
  if (result.badRequest) return res.status(400).json({ error: result.badRequest });
  if (result.conflict) return res.status(409).json({ error: result.conflict });
  if (result.created) return res.status(201).json({ id: result.id, lifecycle: result.lifecycle });
  if (result.ok) return res.status(successStatus).json(result);
  return res.status(successStatus).json(result);
}

router.post("/reserve", requireRole(["worker", "superadmin"]), async (req, res, next) => {
  try {
    const body = reserveSchema.parse(req.body);
    const result = await store.reserveBooking(req.user, body);
    return mapBookingResult(res, result, 201);
  } catch (err) {
    return next(err);
  }
});

router.post("/full", requireRole(["worker", "superadmin"]), async (req, res, next) => {
  try {
    const body = fullSchema.parse(req.body);
    const result = await store.fullBooking(req.user, body);
    return mapBookingResult(res, result);
  } catch (err) {
    return next(err);
  }
});

router.post("/reserve-bulk", requireRole(["worker", "superadmin"]), async (req, res, next) => {
  try {
    const body = reserveBulkSchema.parse(req.body);
    const result = await store.reserveBulk(req.user, body);
    return mapBookingResult(res, result, 201);
  } catch (err) {
    return next(err);
  }
});

router.post("/full-bulk", requireRole(["worker", "superadmin"]), async (req, res, next) => {
  try {
    const body = fullBulkSchema.parse(req.body);
    const result = await store.fullBulk(req.user, body);
    return mapBookingResult(res, result);
  } catch (err) {
    return next(err);
  }
});

router.delete("/:id", requireRole(["superadmin"]), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });
    const result = await store.deleteBooking(id);
    if (!result) return res.status(404).json({ error: "Not found" });
    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
});

router.get("/bus/:busId", async (req, res, next) => {
  try {
    const busId = Number(req.params.busId);
    if (!Number.isFinite(busId)) return res.status(400).json({ error: "Invalid busId" });
    const rows = await store.listBookingsByBus(req.user, busId);
    if (!rows) return res.status(404).json({ error: "Not found" });
    if (rows.forbidden) return res.status(403).json({ error: "Forbidden" });
    return res.json({ bookings: rows });
  } catch (err) {
    return next(err);
  }
});

export default router;
