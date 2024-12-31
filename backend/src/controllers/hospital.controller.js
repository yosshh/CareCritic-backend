import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Hospital } from "../models/hospital.models.js";
import mongoose from "mongoose";

const generateAccessAndRefreshToken = async (hospitalId, role) => {
  try {
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      throw new ApiError(404, "Hospital not found");
    }

    // Use schema methods to generate tokens
    const accessToken = hospital.generateAccessToken();
    const refreshToken = hospital.generateRefreshToken();

    hospital.refreshToken = refreshToken;
    await hospital.save({ validateBeforeSave: false });

    console.log("Tokens generated:", { accessToken, refreshToken });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Error generating tokens:", error);
    throw new ApiError(500, "Error generating tokens");
  }
};



const createHospital = asyncHandler(async (req, res) => {
  try {
    const {
      hospitalName,
      ContactNumber,
      hospitalEmail,
      password,
      address,
      role,
    } = req.body;
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
      role,
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

const loginHospitals = asyncHandler(async (req, res) => {
  try {
    const { hospitalEmail, password, role } = req.body;

    if (!hospitalEmail) {
      throw new ApiError(400, "Email is required.");
    }
    if (!password) {
      throw new ApiError(400, "Password is required.");
    }

    const hospital = await Hospital.findOne({ hospitalEmail });
    if (!hospital) {
      throw new ApiError(404, "Hospital does not exist.");
    }

    const isPasswordValid = await hospital.isPasswordCorrect(password);
    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid hospital credentials.");
    }

    if (role !== hospital.role) {
      throw new ApiError(400, "Invalid role credentials.");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      hospital._id
    );

    const loggedInHospital = await Hospital.findById(hospital._id).select(
      "-password -refreshToken"
    );

    const options = {
      httpOnly: true,
      secure: true,  // Ensures cookies are sent only over HTTPS
      sameSite: "Strict", // Prevents CSRF by restricting cookie sharing
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            hospital: loggedInHospital,
            refreshToken,
            accessToken,
          },
          `Hospital Logged in successfully, welcome back ${hospital.hospitalName}!`
        )
      );
  } catch (error) {
    console.error("Login Error:", error.message);
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
    let HospitalLogoUrl = null;
    if (req.file?.path) {
      const HospitalLogo = await uploadOnCloudinary(req.file.path);
      if (!HospitalLogo.url) {
        throw new ApiError(400, "Error while uploading Company Logo.");
      }
      HospitalLogoUrl = HospitalLogo.url;
    }

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

    if (HospitalLogoUrl) {
      updateData.logo = HospitalLogoUrl;
    }

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
      .json(
        new ApiResponse(200, updatedHospital, "Hospital updated successfully.")
      );
  } catch (error) {
    console.error("Update Hospital Error:", error.message);
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode || 500, error.message));
  }
});

export { loginHospitals, createHospital, updateHospital };
