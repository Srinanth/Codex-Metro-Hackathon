import { RecordModel, type BusinessRecord } from "../models/record.model.js";
import type { CreateRecordInput, UpdateRecordInput } from "../types/record.js";
import { NotFoundError } from "../utils/app-error.js";

export class RecordService {
  async create(input: CreateRecordInput): Promise<BusinessRecord> {
    return RecordModel.create(input);
  }

  async findAll(): Promise<BusinessRecord[]> {
    return RecordModel.find().sort({ createdAt: -1 });
  }

  async findByBusinessId(businessId: string): Promise<BusinessRecord[]> {
    return RecordModel.find({ businessId }).sort({ createdAt: -1 });
  }

  async findByBusinessIdAndEntityType(businessId: string, entityType: string): Promise<BusinessRecord[]> {
    return RecordModel.find({ businessId, entityType }).sort({ createdAt: -1 });
  }

  async findById(id: string): Promise<BusinessRecord> {
    const record = await RecordModel.findById(id);
    if (!record) throw new NotFoundError("Record");
    return record;
  }

  async update(id: string, input: UpdateRecordInput): Promise<BusinessRecord> {
    const record = await RecordModel.findByIdAndUpdate(id, input, { new: true, runValidators: true });
    if (!record) throw new NotFoundError("Record");
    return record;
  }

  async delete(id: string): Promise<BusinessRecord> {
    const record = await RecordModel.findByIdAndDelete(id);
    if (!record) throw new NotFoundError("Record");
    return record;
  }
}
