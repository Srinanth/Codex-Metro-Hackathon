import type { Response } from "express";
import type { ApiResponse } from "../types/express.js";

export function sendSuccess<T>(response: Response, statusCode: number, message: string, data: T): Response<ApiResponse<T>> {
  return response.status(statusCode).json({ success: true, message, data });
}
