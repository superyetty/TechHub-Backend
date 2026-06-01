import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const dbURI = async () => {
  try {
    await mongoose.connect(`${process.env.db_URI}`);
    console.log("Database connected successfully");
  } catch (err) {
    console.log("Error connecting to the database");
  }
};
export default dbURI;
