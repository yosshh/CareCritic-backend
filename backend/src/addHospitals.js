import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import { Hospital } from "./models/hospital.models.js";

dotenv.config();


const hospitals = JSON.parse(fs.readFileSync("./src/seed/hospitals.json", "utf-8"));

const insertHospitals = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB!");

    await Hospital.insertMany(hospitals);
    console.log("Hospitals inserted successfully!");

    await mongoose.connection.close();
  } catch (error) {
    console.error("Error inserting hospitals:", error);
  }
};

insertHospitals();


