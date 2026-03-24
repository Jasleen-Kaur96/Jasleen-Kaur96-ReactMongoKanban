import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://jasleenkaur_db_user:nzWG4onkLVbiIEFr@cluster.pryjf4d.mongodb.net/kanban");
    console.log("MongoDB connected");
  } catch (err) {
    console.error("DB connection error", err);
    process.exit(1);
  }
};