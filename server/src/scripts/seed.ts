import mongoose from "mongoose";
import { connectDatabase } from "../config/database.js";
import { BusinessModel } from "../models/business.model.js";
import { RecordModel } from "../models/record.model.js";

const businesses = [
  { name: "Tony's Barber", businessType: "Barber Shop", description: "Classic cuts, beard care, and friendly neighbourhood service.", address: "12 Indiranagar Main Road", phone: "+91 98765 01001", configuration: { workingHours: { monday: { start: "10:00", end: "20:00" }, tuesday: { start: "10:00", end: "20:00" }, wednesday: { start: "10:00", end: "20:00" }, thursday: { start: "10:00", end: "20:00" }, friday: { start: "10:00", end: "20:00" }, saturday: { start: "10:00", end: "20:00" } }, slotDuration: 30, services: ["Haircut", "Beard trim", "Haircut and beard"] }, capabilities: ["appointments", "faq"], rules: ["No walk-ins after 7 PM", "Please arrive five minutes early"] },
  { name: "Elite Salon", businessType: "Salon", description: "Contemporary hair, beauty, and grooming appointments.", address: "45 Koramangala 5th Block", phone: "+91 98765 01002", configuration: { workingHours: { monday: { start: "09:00", end: "19:00" }, tuesday: { start: "09:00", end: "19:00" }, wednesday: { start: "09:00", end: "19:00" }, thursday: { start: "09:00", end: "19:00" }, friday: { start: "09:00", end: "19:00" }, saturday: { start: "09:00", end: "19:00" } }, slotDuration: 45, services: ["Hair styling", "Facial", "Manicure"] }, capabilities: ["appointments", "faq"], rules: ["Cancellations require two hours notice"] },
  { name: "Pixel Gaming Cafe", businessType: "Gaming Cafe", description: "Console and PC gaming stations for solo play and groups.", address: "8 Church Street", phone: "+91 98765 01003", configuration: { workingHours: { monday: { start: "11:00", end: "23:00" }, tuesday: { start: "11:00", end: "23:00" }, wednesday: { start: "11:00", end: "23:00" }, thursday: { start: "11:00", end: "23:00" }, friday: { start: "11:00", end: "23:00" }, saturday: { start: "10:00", end: "23:00" }, sunday: { start: "10:00", end: "22:00" } }, devices: ["PS5", "Gaming PC", "Nintendo Switch"], hourlyRate: 150 }, capabilities: ["reservations", "queue", "faq"], rules: ["Valid ID required for late-night sessions", "Food is not allowed near gaming stations"] },
  { name: "Smile Dental Clinic", businessType: "Dental Clinic", description: "Thoughtful dental consultations and treatment appointments.", address: "28 Jayanagar 4th Block", phone: "+91 98765 01004", configuration: { workingHours: { monday: { start: "09:30", end: "18:30" }, tuesday: { start: "09:30", end: "18:30" }, wednesday: { start: "09:30", end: "18:30" }, thursday: { start: "09:30", end: "18:30" }, friday: { start: "09:30", end: "18:30" }, saturday: { start: "09:30", end: "14:00" } }, slotDuration: 30, services: ["Consultation", "Cleaning", "Check-up"] }, capabilities: ["appointments", "consultations", "faq"], rules: ["Bring previous medical records when available", "Emergency cases receive priority"] },
];

async function seed() {
  await connectDatabase();
  const saved = await Promise.all(businesses.map((business) => BusinessModel.findOneAndUpdate({ name: business.name }, { $set: business }, { new: true, upsert: true, runValidators: true })));
  const [tonysBarber, eliteSalon, pixelGamingCafe, smileDentalClinic] = saved;
  if (!tonysBarber || !eliteSalon || !pixelGamingCafe || !smileDentalClinic) throw new Error("Demo businesses could not be created.");
  await RecordModel.deleteMany({ businessId: { $in: saved.map((business) => business._id) } });
  await RecordModel.create([
    { businessId: tonysBarber._id, entityType: "appointment", status: "confirmed", data: { customer: "Aarav", service: "Haircut", date: "2026-07-20", startTime: "11:00", endTime: "11:30" }, metadata: {} },
    { businessId: tonysBarber._id, entityType: "appointment", status: "completed", data: { customer: "Maya", service: "Beard trim", date: "2026-07-19", startTime: "16:00", endTime: "16:30" }, metadata: {} },
    { businessId: eliteSalon._id, entityType: "appointment", status: "pending", data: { customer: "Riya", service: "Hair styling", date: "2026-07-20", startTime: "14:00", endTime: "14:45" }, metadata: {} },
    { businessId: pixelGamingCafe._id, entityType: "reservation", status: "confirmed", data: { customer: "Dev", resource: "PS5", date: "2026-07-20", startTime: "18:00", endTime: "20:00", duration: 2 }, metadata: {} },
    { businessId: pixelGamingCafe._id, entityType: "queue", status: "waiting", data: { customer: "Anika" }, metadata: { position: 1 } },
    { businessId: smileDentalClinic._id, entityType: "appointment", status: "confirmed", data: { customer: "Kabir", service: "Consultation", date: "2026-07-21", startTime: "10:00", endTime: "10:30" }, metadata: {} },
  ]);
  console.log(`Seeded ${saved.length} demo businesses and sample operations.`);
}

seed().catch((error: unknown) => { console.error("Seeding failed:", error); process.exitCode = 1; }).finally(async () => { await mongoose.disconnect(); });
