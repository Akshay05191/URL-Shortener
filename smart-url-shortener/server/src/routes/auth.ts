import { Router } from "express";
import { signup, login, getMe } from "../controllers/auth.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/auth/signup", signup);
router.post("/auth/login", login);
router.get("/auth/me", requireAuth, getMe);

export default router;
