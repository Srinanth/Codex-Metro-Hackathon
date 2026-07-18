import { AppointmentEngine } from "./appointment.engine.js";
import { EngineRegistry } from "./engine-registry.js";
import { OrderEngine } from "./order.engine.js";
import { QueueEngine } from "./queue.engine.js";
import { ReservationEngine } from "./reservation.engine.js";

export function createEngineRegistry(): EngineRegistry {
  return new EngineRegistry()
    .register(new AppointmentEngine())
    .register(new OrderEngine())
    .register(new ReservationEngine())
    .register(new QueueEngine());
}
