import type { Request, Response } from "express";
import { BusinessService } from "../services/business.service.js";
import type { CreateBusinessInput, UpdateBusinessInput } from "../types/business.js";
import { sendSuccess } from "../utils/api-response.js";
import { getRouteId } from "../utils/request-params.js";

const businessService = new BusinessService();

export async function createBusiness(request: Request, response: Response): Promise<void> {
  const business = await businessService.create(request.body as CreateBusinessInput);
  sendSuccess(response, 201, "Business created.", business);
}

export async function getBusinesses(_request: Request, response: Response): Promise<void> {
  sendSuccess(response, 200, "Businesses retrieved.", await businessService.findAll());
}

export async function getBusiness(request: Request, response: Response): Promise<void> {
  sendSuccess(response, 200, "Business retrieved.", await businessService.findById(getRouteId(request)));
}

export async function updateBusiness(request: Request, response: Response): Promise<void> {
  const business = await businessService.update(getRouteId(request), request.body as UpdateBusinessInput);
  sendSuccess(response, 200, "Business updated.", business);
}

export async function deleteBusiness(request: Request, response: Response): Promise<void> {
  sendSuccess(response, 200, "Business deleted.", await businessService.delete(getRouteId(request)));
}
