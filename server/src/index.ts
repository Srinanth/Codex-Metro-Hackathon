import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { connectDatabase } from "./config/database.js";
import { errorHandler } from "./middleware/error-handler.js";
import { apiRouter } from "./routes/index.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", apiRouter);
app.use(errorHandler);

connectDatabase().catch((error) => console.error("MongoDB connection failed:", error));
const server = app.listen(env.port, () => console.log(`BizzAI API listening on :${env.port}`));
server.on("error", (error: NodeJS.ErrnoException) => {
  if (error.code === "EADDRINUSE") {
    console.error(`BizzAI API could not start: port ${env.port} is already in use. Set PORT in .env to another available port.`);
  } else {
    console.error("BizzAI API could not start:", error);
  }
  process.exitCode = 1;
});
