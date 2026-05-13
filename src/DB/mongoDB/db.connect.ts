import mongoose from "mongoose";
import { DB_LOCAL } from "../../config/config.service";


export const dbConnection = async () => {
    try {
        await mongoose.connect(`${DB_LOCAL}`, {
            serverSelectionTimeoutMS: 5000
        })
        console.log("Database connected successfully")
    } catch (error) {
        console.log("failed to connect database")
    }
}