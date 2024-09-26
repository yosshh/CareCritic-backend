import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import { Hospital } from "./models/hospital.models.js";
import { DB_NAME } from "./constants.js";
import { uploadOnCloudinary } from "./utils/cloudinary.js";

dotenv.config();


const hospitals = JSON.parse(fs.readFileSync("./src/seed/hospitals.json", "utf-8"));

const insertHospitals = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    console.log("Connected to MongoDB!");

    for (let hospital of hospitals) {
      console.log(`Processing hospital: ${hospital.hospitalName}, localImagePath: ${hospital.localImagePath}`);
      

      try {
        if (hospital.localImagePath) {  
          console.log("we are into try statement");
          const uploadResponse = await uploadOnCloudinary(hospital.localImagePath);
          console.log(uploadResponse);
          if (uploadResponse) {
            hospital.hospitalImage = uploadResponse.url;
            console.log(`image uploaded for ${hospital.hospitalName} with ${uploadResponse.url}`);
              
          }
        }
      } catch (imageUploadError) {
        console.error(`Error uploading image for hospital: ${hospital.hospitalName}`, imageUploadError);
      }
    } 

    await Hospital.insertMany(hospitals);
    console.log("Hospitals inserted successfully!");

    await mongoose.connection.close();
  } catch (error) {
    console.error("Error inserting hospitals:", error);
  }
};

insertHospitals();


