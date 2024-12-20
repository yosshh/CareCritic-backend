import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Doctor } from "../models/doctor.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const registerDoctor = asyncHandler(async(req, res)=> {
    const { name, contactNumber, email, specialty, qualification, day, startTime, endTime, password  } = req.body;
    if (
        [name, email, contactNumber, password, specialty, qualification, day, startTime, endTime,].some(
          (field) => !field || field.trim() === ""
        )
      ) {
        throw new ApiError(400, "All fields are required");
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ApiError(400, "Invalid email format");
  }

  // Check if user already exists by email or phone number
  const existedDoctor = await Doctor.findOne({
    $or: [{ email }, { contactNumber }],
  });
  if (existedDoctor) {
    throw new ApiError(
      409,
      "User with this email or phone number already exists."
    );
  }

  let profilePhotoLocalPath;
  if (req.file) {
    profilePhotoLocalPath = req.file.path;
    // console.log("Profile photo file path:", profilePhotoLocalPath);
  }
  let profilePhoto = null;
  if (profilePhotoLocalPath) {
    profilePhoto = await uploadOnCloudinary(profilePhotoLocalPath);
  }

  // Create new user
  const doctor = await User.create({
    name, 
    contactNumber, 
    email, 
    specialty, 
    qualification, 
    day, 
    startTime, 
    endTime, 
    password,
    profile: {
      profilePhoto: profilePhoto?.url || "",
    },
  });
})