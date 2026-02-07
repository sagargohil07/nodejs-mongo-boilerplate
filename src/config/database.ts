import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    await mongoose.connect(mongoURI as string);
    mongoose.connection.on("error", (err) => {});
  } catch (error) {
    process.exit(1);
  }
};
