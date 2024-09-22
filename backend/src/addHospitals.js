import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import { Hospital } from "./models/hospital.models.js";

dotenv.config();

// Read the hospitals data from the JSON file
const hospitals = JSON.parse(fs.readFileSync("./src/seed/hospitals.json", "utf-8"));

const insertHospitals = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB!");

    // Insert hospitals
    await Hospital.insertMany(hospitals);
    console.log("Hospitals inserted successfully!");

    // Close the MongoDB connection
    await mongoose.connection.close();
  } catch (error) {
    console.error("Error inserting hospitals:", error);
  }
};

insertHospitals();


