import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = async() => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Mongo db successfully connected!");
        
    } catch (error) {
        console.log("Could not connect to database!" + error)
        process.exit(1); //exit with failure
    }
}