import type { ZodType } from "zod";

export type RequestPart = "body" | "params" | "query";
export type RequestValidation = Partial<Record<RequestPart, ZodType>>;

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};
