import mongoose from "mongoose";
export const authConnection = async () => {
  try {
    await mongoose.connect(
      process.env.DEV_PALACE_MONGO_URL || "mongodb://localhost:27017/dev_palace"
    );
    console.log("Connected to MONGO cluster");
  } catch (error) {
    console.error("Error connecting to MongoDB: ", error);
  }
};
