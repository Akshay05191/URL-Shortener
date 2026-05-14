import mongoose from "mongoose";
import { logger } from "./logger";

let isConnected = false;

export async function connectMongoDB(): Promise<void> {
  if (isConnected) {
    return;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not set.");
  }

  try {
    await mongoose.connect(uri);
    isConnected = true;
    logger.info("Connected to MongoDB Atlas");
  } catch (error) {
    logger.error({ error }, "Failed to connect to MongoDB");
    throw error;
  }
}
