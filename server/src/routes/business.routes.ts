import { Router } from "express";
import { createBusiness, deleteBusiness, getBusiness, getBusinesses, updateBusiness } from "../controllers/business.controller.js";
import { validateRequest } from "../middleware/validate-request.js";
import { asyncHandler } from "../utils/async-handler.js";
import { createBusinessSchema, idParamsSchema, updateBusinessSchema } from "../utils/validation.js";

export const businessRouter: Router = Router();
businessRouter.post("/", validateRequest({ body: createBusinessSchema }), asyncHandler(createBusiness));
businessRouter.get("/", asyncHandler(getBusinesses));
businessRouter.get("/:id", validateRequest({ params: idParamsSchema }), asyncHandler(getBusiness));
businessRouter.put("/:id", validateRequest({ params: idParamsSchema, body: updateBusinessSchema }), asyncHandler(updateBusiness));
businessRouter.delete("/:id", validateRequest({ params: idParamsSchema }), asyncHandler(deleteBusiness));
