import type { Request, Response } from "express";
import { RecordService } from "../services/record.service.js";
import type { CreateRecordInput, UpdateRecordInput } from "../types/record.js";
import { sendSuccess } from "../utils/api-response.js";
import { getRouteId } from "../utils/request-params.js";

const recordService = new RecordService();

export async function createRecord(request: Request, response: Response): Promise<void> {
  sendSuccess(response, 201, "Record created.", await recordService.create(request.body as CreateRecordInput));
}

export async function getRecords(_request: Request, response: Response): Promise<void> {
  sendSuccess(response, 200, "Records retrieved.", await recordService.findAll());
}

export async function getRecord(request: Request, response: Response): Promise<void> {
  sendSuccess(response, 200, "Record retrieved.", await recordService.findById(getRouteId(request)));
}

export async function updateRecord(request: Request, response: Response): Promise<void> {
  sendSuccess(response, 200, "Record updated.", await recordService.update(getRouteId(request), request.body as UpdateRecordInput));
}

export async function deleteRecord(request: Request, response: Response): Promise<void> {
  sendSuccess(response, 200, "Record deleted.", await recordService.delete(getRouteId(request)));
}
