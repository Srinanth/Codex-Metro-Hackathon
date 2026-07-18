import { Router } from "express";
import { createRecord, deleteRecord, getRecord, getRecords, updateRecord } from "../controllers/record.controller.js";
import { validateRequest } from "../middleware/validate-request.js";
import { asyncHandler } from "../utils/async-handler.js";
import { createRecordSchema, idParamsSchema, updateRecordSchema } from "../utils/validation.js";

export const recordRouter: Router = Router();
recordRouter.post("/", validateRequest({ body: createRecordSchema }), asyncHandler(createRecord));
recordRouter.get("/", asyncHandler(getRecords));
recordRouter.get("/:id", validateRequest({ params: idParamsSchema }), asyncHandler(getRecord));
recordRouter.put("/:id", validateRequest({ params: idParamsSchema, body: updateRecordSchema }), asyncHandler(updateRecord));
recordRouter.delete("/:id", validateRequest({ params: idParamsSchema }), asyncHandler(deleteRecord));
