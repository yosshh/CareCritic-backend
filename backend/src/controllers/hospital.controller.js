import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Hospital } from "../models/hospital.models.js";
import mongoose from "mongoose";
import { Review } from "../models/review.models.js";

const createHospital = asyncHandler(async (req, res) => {
  try {
    const { hospitalName, ContactNumber, hospitalEmail, password, address } = req.body;
    if (
      [hospitalName, ContactNumber, hospitalEmail, password, address].some(
        (field) => field?.trim() === ""
      )
    ) {
      throw new ApiError(400, "All fields are required");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(hospitalEmail)) {
      throw new ApiError(400, "Invalid email format");
    }

    const existedHospital = await Hospital.findOne({
      $or: [{ ContactNumber }, { hospitalEmail }],
    });
    if (existedHospital) {
      throw new ApiError(
        409,
        "Hospital with this contact number or email already exists."
      );
    }

    const hospital = await Hospital.create({
      hospitalName,
      hospitalEmail,
      password,
      address,
      ContactNumber,
      userId: req.user._id,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, hospital, "Hospital created successfully."));
  } catch (error) {
    console.error(error);
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode || 500, error.message));
  }
});

const getAllHospitals = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const hospital = await Hospital.find({ userId });
    if (!hospital.length) {
      throw new ApiError(404, "No hospitals found.");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, hospital, "Hospital retrieved successfully."));
  } catch (error) {
    console.error(error);
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode || 500, error.message));
  }
});

const updateHospital = asyncHandler(async (req, res) => {
  try {
    const {
      hospitalName,
      hospitalEmail,
      address,
      city,
      pincode,
      ContactNumber,
      specializedIn,
    } = req.body;
    if (
      !(
        hospitalName ||
        hospitalEmail ||
        address ||
        city ||
        pincode ||
        ContactNumber ||
        specializedIn
      )
    ) {
      throw new ApiError(400, "Some credentials are missing.");
    }

    // Validate Hospital ID
    if (!req.params.id) {
      throw new ApiError(400, "Hospital ID is missing.");
    }

    if (!req.params.id || !mongoose.isValidObjectId(req.params.id)) {
      throw new ApiError(400, "Invalid Hospital ID.");
    }

    // cloudinary code for hospital image

    // Update the hospital
    const updateData = {
      hospitalName,
      hospitalEmail,
      address,
      city,
      pincode,
      ContactNumber,
      specializedIn,
    };

    const updatedHospital = await Hospital.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );
    if (!updatedHospital) {
      throw new ApiError(404, "Hospital not found.");
    }

    return res
    .status(200)
    .json(new ApiResponse(200, updatedHospital, "Hospital updated successfully."))
  } catch (error) {
    console.error("Update Hospital Error:", error.message);
        return res.status(error.statusCode || 500).json(new ApiError(error.statusCode || 500, error.message));
  }
});



export { getAllHospitals, createHospital, updateHospital }