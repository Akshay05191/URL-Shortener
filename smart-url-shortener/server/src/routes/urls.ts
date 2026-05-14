import { Router } from "express";
import {
  createUrl,
  listUrls,
  getUrl,
  updateUrl,
  deleteUrl,
  resolveUrl,
  verifyUrlPassword,
} from "../controllers/urls.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/urls", requireAuth, listUrls);
router.post("/urls", requireAuth, createUrl);
router.get("/urls/:id", requireAuth, getUrl);
router.patch("/urls/:id", requireAuth, updateUrl);
router.delete("/urls/:id", requireAuth, deleteUrl);

router.get("/r/:code", resolveUrl);
router.post("/r/:code/verify-password", verifyUrlPassword);

export default router;
