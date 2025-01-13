import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Doctor } from "../models/doctor.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";


const generateAccessAndRefreshToken = async (doctorId, role) => {
  try {
    const doctor = await Doctor.findById(doctorId);
    if (!doctorId) {
      throw new ApiError(404, "Hospital not found");
    }

    // Use schema methods to generate tokens
    const accessToken = doctor.generateAccessToken();
    const refreshToken = doctor.generateRefreshToken();

    doctor.refreshToken = refreshToken;
    await doctor.save({ validateBeforeSave: false });

    // console.log("Tokens generated:", { accessToken, refreshToken });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Error generating tokens:", error);
    throw new ApiError(500, "Error generating tokens");
  }
};


const registerDoctor = asyncHandler(async (req, res) => {
  try {
    const {
      fullName,
      contactNumber,
      email,
      specialty,
      qualification,
      password,
      role,
      day,
      startTime,
      endTime,
      isActive,
      experienceInYears,
      worksIn,
    } = req.body;

    // Basic validation for required fields
    if (
      [fullName, email, contactNumber, password, specialty, qualification].some(
        (field) => !field || (Array.isArray(field) ? field.length === 0 : field.trim() === "")
      )
    ) {
      throw new ApiError(400, "All fields are required");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ApiError(400, "Invalid email format");
    }

    // Check for existing doctor
    const existedDoctor = await Doctor.findOne({
      $or: [{ email }, { contactNumber }],
    });
    if (existedDoctor) {
      throw new ApiError(409, "Doctor with this email or phone already exists.");
    }

    // Handle profile photo upload
    let profilePhoto = "";
    if (req.file) {
      const uploadedPhoto = await uploadOnCloudinary(req.file.path);
      profilePhoto = uploadedPhoto?.url || "";
    }

    // Create the doctor
    const doctor = await Doctor.create({
      fullName,
      contactNumber,
      email,
      specialty,
      password,
      qualification: Array.isArray(qualification) ? qualification : [qualification],
      role: "Doctor", 
      availability: [
        {
          day: day || "Monday-Friday",
          startTime: startTime || "10:00 AM",
          endTime: endTime || "6:00 PM",
        },
      ],
      isActive: isActive !== undefined ? isActive : true,
      experienceInYears: experienceInYears || 0,
      worksIn,
      profilePhoto,
    });

    const createdDoctor = await Doctor.findById(doctor._id).select(
      "-password -refreshToken"
    );

    if (!createdDoctor) {
      throw new ApiError(500, "Doctor registration failed.");
    }

    return res
      .status(201)
      .json(
        new ApiResponse(200, createdDoctor, "Doctor registered successfully")
      );
  } catch (error) {
    console.error(error.stack);  // Log full error stack for debugging
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode || 500, error.message));
  }
});


const loginDoctor = asyncHandler(async (req, res) => {
  try {
    const { email, password, role } = req.body;
console.log('req body', req.body);

    if (!email) {
      throw new ApiError(400, "Email is required.");
    }
    if (!password) {
      throw new ApiError(400, "Password is required.");
    }

    const doctor = await Doctor.findOne({ email });
    if (!doctor) {
      throw new ApiError(404, "Doctor does not exist.");
    }

    const isPasswordValid = await doctor.isPasswordCorrect(password);
    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid Doctor credentials.");
    }

    if (role !== doctor.role) {
      throw new ApiError(400, "Invalid role credentials.");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      doctor._id
    );

    const loggedInDoctor = await Doctor.findById(doctor._id).select(
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
            doctor: loggedInDoctor,
            refreshToken,
            accessToken,
          },
          `Logged in successfully, welcome back ${doctor.name}!`
        )
      );
  } catch (error) {
    console.error("Login Error:", error.message);
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode || 500, error.message));
  }
});

// LOGOUT USER
const logoutDoctor = async (req, res) => {
  try {
      return res.status(200).cookie("token", "", { maxAge: 0 }).json({
          message: "Logged out successfully.",
          success: true
      })
  } catch (error) {
      console.log(error);
  }
}


// Update User
const updateDoctor = asyncHandler(async (req, res) => {
  try {
    // console.log("Logged-in user:", req.user); 
    const doctorId = req.doctor?._id; 

    const {fullName,
      contactNumber,
      email,
      specialty,
      qualification,
      role,
      day,
      startTime,
      endTime,
      isActive,
      experienceInYears,
      worksIn, } = req.body;

    if (!(fullName || contactNumber || email || specialty || qualification || role || day || startTime || endTime || isActive || experienceInYears || worksIn)) {
      throw new ApiError(400, "No fields to update.");
    }

    const updateData = {};

    // Update non-nested fields
    if (fullName) updateData.fullName = fullName;
    if (email) updateData.email = email;
    if (contactNumber) updateData.contactNumber = contactNumber;
    if (specialty) updateData.specialty = specialty;
    if (qualification) updateData.qualification = qualification;
    if (isActive) updateData.isActive = isActive;
    if (worksIn) updateData.worksIn = worksIn;
    if (experienceInYears) updateData.experienceInYears = isActive;

    // Update nested fields inside `availability`
    if (day) updateData["availability.day"] = day;
    if (startTime) updateData["availability.startTime"] = startTime;
    if (endTime) updateData["availability.endTime"] = endTime;

    if (req.file) {
      const profilePhoto = await uploadOnCloudinary(req.file.path);
      if (!profilePhoto.url) {
        throw new ApiError(400, "Error while uploading file");
      }
      updateData["profile.photo"] = profilePhoto.url;
    }

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      doctorId,
      { $set: updateData }, // Use dot notation for nested fields
      { new: true, runValidators: true }
    ).select("-password"); // Exclude password from response

    return res
      .status(200)
      .json(
        new ApiResponse(200, updatedDoctor, "Account details updated successfully.")
      );
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode || 500, error.message));
  }
});

export { registerDoctor, loginDoctor, logoutDoctor, updateDoctor}