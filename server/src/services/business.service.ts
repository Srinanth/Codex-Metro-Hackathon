import { BusinessModel, type Business } from "../models/business.model.js";
import type { CreateBusinessInput, UpdateBusinessInput } from "../types/business.js";
import { NotFoundError } from "../utils/app-error.js";

export class BusinessService {
  async create(input: CreateBusinessInput): Promise<Business> {
    return BusinessModel.create(input);
  }

  async findAll(): Promise<Business[]> {
    return BusinessModel.find().sort({ createdAt: -1 });
  }

  async findById(id: string): Promise<Business> {
    const business = await BusinessModel.findById(id);
    if (!business) throw new NotFoundError("Business");
    return business;
  }

  async update(id: string, input: UpdateBusinessInput): Promise<Business> {
    const business = await BusinessModel.findByIdAndUpdate(id, input, { new: true, runValidators: true });
    if (!business) throw new NotFoundError("Business");
    return business;
  }

  async delete(id: string): Promise<Business> {
    const business = await BusinessModel.findByIdAndDelete(id);
    if (!business) throw new NotFoundError("Business");
    return business;
  }
}
