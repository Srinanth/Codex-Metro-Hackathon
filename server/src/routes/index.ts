import { Router } from "express";
import { getHealth } from "../controllers/health.controller.js";
import { agentRouter } from "./agent.routes.js";
import { businessRouter } from "./business.routes.js";
import { recordRouter } from "./record.routes.js";

export const apiRouter: Router = Router();
apiRouter.get("/health", getHealth);
apiRouter.use("/business", businessRouter);
apiRouter.use("/records", recordRouter);
apiRouter.use("/ai", agentRouter);
