import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Doctor } from "../models/doctor.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const registerDoctor = asyncHandler(async (req, res) => {
  try {
    const { name, contactNumber, email, specialty, qualification, password } =
      req.body;
    if (
      [name, email, contactNumber, password, specialty, qualification].some(
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
      // console.log("Cloudinary URL:", profilePhoto?.url);
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
      experienceInYears,
      password,
      profilePhoto: profilePhoto?.url || "",
    });

    const createdDoctor = await Doctor.findById(doctor._id).select(
      "-password -refreshToken"
    );

    if (!createdDoctor) {
      throw new ApiError(
        500,
        "Something went wrong while registering the doctor"
      );
    }

    return res
      .status(201)
      .json(
        new ApiResponse(200, createdDoctor, "Doctor registered successfully")
      );
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode || 500, error.message));
  }
});

export { registerDoctor}