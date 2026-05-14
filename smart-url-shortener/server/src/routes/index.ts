import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import urlsRouter from "./urls.js";
import analyticsRouter from "./analytics.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(urlsRouter);
router.use(analyticsRouter);

export default router;
