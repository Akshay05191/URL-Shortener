import { Router } from "express";
import { getUrlAnalytics, getDashboardAnalytics } from "../controllers/analytics.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/urls/:id/analytics", requireAuth, getUrlAnalytics);
router.get("/analytics/dashboard", requireAuth, getDashboardAnalytics);

export default router;
