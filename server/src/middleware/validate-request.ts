import type { NextFunction, Request, Response } from "express";
import type { RequestValidation } from "../types/express.js";
import { AppError } from "../utils/app-error.js";

export function validateRequest(schemas: RequestValidation) {
  return (request: Request, _response: Response, next: NextFunction) => {
    const validatePart = (schema: NonNullable<RequestValidation["body"]>, input: unknown): unknown => {
      const result = schema.safeParse(input);
      if (!result.success) {
        throw new AppError("Request validation failed.", 400, result.error.flatten());
      }
      return result.data;
    };
    try {
      if (schemas.body) request.body = validatePart(schemas.body, request.body);
      if (schemas.params) request.params = validatePart(schemas.params, request.params) as typeof request.params;
      if (schemas.query) request.query = validatePart(schemas.query, request.query) as typeof request.query;
    } catch (error: unknown) {
      if (error instanceof AppError) return next(error);
      return next(new AppError("Request validation failed.", 400));
    }
    return next();
  };
}
