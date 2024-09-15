import mongoose from "mongoose";

// connect mongobd database
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log("Erorr connection to MongoDB: ", error.message);
    process.exit(1);
  }
};
