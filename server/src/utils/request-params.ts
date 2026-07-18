import type { Request } from "express";
import { AppError } from "./app-error.js";

export function getRouteId(request: Request): string {
  const id = request.params.id;
  if (typeof id !== "string") throw new AppError("Request validation failed.", 400);
  return id;
}
