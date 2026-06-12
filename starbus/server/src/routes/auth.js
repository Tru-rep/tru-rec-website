import { Router } from "express";
import { z } from "zod";
import { store } from "../db/data.js";
import { verifyPassword } from "../utils/password.js";
import { signAccessToken } from "../utils/jwt.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const loginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1).max(255),
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await store.findUserByEmail(email);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await verifyPassword(password, user.password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = signAccessToken({
      sub: String(user.id),
      id: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
      employer_user_id: user.employer_user_id != null ? Number(user.employer_user_id) : null,
    });

    return res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    return next(err);
  }
});

router.get("/me", requireAuth, async (req, res) => {
  return res.json({ user: req.user });
});

export default router;
