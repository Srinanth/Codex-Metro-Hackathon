import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/app-error.js";

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  console.error(err);
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ success: false, message: err.message, data: err.details ?? null });
  }
  return res.status(500).json({ success: false, message: "An unexpected error occurred.", data: null });
}
