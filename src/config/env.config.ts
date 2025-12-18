import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 8800,
  nodeEnv: process.env.NODE_ENV || "development",
  mongodbUri:
    process.env.DEV_PALACE_MONGO_URL || "mongodb://localhost:27017/dev_palace",
  jwt: {
    secret: process.env.JWT_SECRET || "fallback-secret-change-in-production",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },
};
