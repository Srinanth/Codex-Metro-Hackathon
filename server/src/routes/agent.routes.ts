import { Router } from "express";
import { createInteraction, extractBusiness } from "../controllers/agent.controller.js";
import { validateRequest } from "../middleware/validate-request.js";
import { asyncHandler } from "../utils/async-handler.js";
import { createInteractionSchema, extractBusinessSchema } from "../utils/validation.js";

export const agentRouter: Router = Router();
agentRouter.post("/interactions", validateRequest({ body: createInteractionSchema }), asyncHandler(createInteraction));
agentRouter.post("/extract-business", validateRequest({ body: extractBusinessSchema }), asyncHandler(extractBusiness));
