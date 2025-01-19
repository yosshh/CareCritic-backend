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
          `Logged in successfully, welcome back ${doctor.fullName}!`
        )
      );
  } catch (error) {
    console.error("Login Error:", error.message);
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode || 500, error.message));
  }
});


const getDoctor = asyncHandler(async (req, res) => {
  try {
    const keyword = req.query.keyword || "";
    const query = {
      $or: [
        { fullName: { $regex: keyword, $options: "i" } }, // Search by name
        { specialty: { $regex: keyword, $options: "i" } } // Search by specialty
      ]
    };

    const doctors = await Doctor.find(query)
      .populate({
        path: "reviews.user", // Populate the user data in reviews
        select: "fullName email", // Optionally select fields from the User model
      })
      .sort({ createdAt: -1 });

    if (doctors.length === 0) {
      throw new ApiError(404, "Doctors not found.");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, doctors));
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
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

const getDoctorById = asyncHandler(async(req, res)=> {
  try {
      const doctorId = req.params.id;
      const doctor = await Doctor.findById(doctorId).populate({
          path: "reviews.user"
      });
      if(!doctor) {
          throw new ApiError(404, "Doctors not found.")
      }

      return res
      .status(200)
      .json(new ApiResponse(200, doctor))
  } catch (error) {
      console.log(error);
  }
})


// Update User
const updateDoctor = asyncHandler(async (req, res) => {
  try {
    const doctorId = req.doctor?._id;

    if (!doctorId) {
      throw new ApiError(400, "Unauthorized or invalid doctor ID.");
    }

    const {
      fullName,
      contactNumber,
      email,
      specialty,
      qualification,
      day,
      startTime,
      endTime,
      isActive,
      experienceInYears,
    } = req.body;

    if (Object.keys(req.body).length === 0 && !req.file?.path) {
      throw new ApiError(400, "No fields to update.");
    }

    const updateData = {};

    // Update non-nested fields
    if (fullName) updateData.fullName = fullName;
    if (email) updateData.email = email;
    if (contactNumber) updateData.contactNumber = contactNumber;
    if (specialty) updateData.specialty = specialty;
    if (qualification) updateData.qualification = qualification;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (experienceInYears) updateData.experienceInYears = experienceInYears;

    // Update nested fields inside `availability`
    if (day) updateData["availability.day"] = day;
    if (startTime) updateData["availability.startTime"] = startTime;
    if (endTime) updateData["availability.endTime"] = endTime;

    // Handle profile image upload if provided
    let profilePhotoUrl = null;
    if (req.file?.path) {
        const profilePhoto = await uploadOnCloudinary(req.file.path);
        if (!profilePhoto.url) {
            throw new ApiError(400, "Error while uploading Company Logo.");
        }
        profilePhotoUrl = profilePhoto.url;
    }

    if (profilePhotoUrl) {
      updateData.profilePhoto = profilePhotoUrl;
  }

    console.log("Update Data:", updateData);

    // Update doctor in the database
    const updatedDoctor = await Doctor.findByIdAndUpdate(
      doctorId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedDoctor) {
      throw new ApiError(404, "Doctor not found.");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedDoctor,
          "Account details updated successfully."
        )
      );
  } catch (error) {
    console.error("Error updating doctor:", error);
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode || 500, error.message));
  }
});







export { registerDoctor, loginDoctor, logoutDoctor, updateDoctor, getDoctor, getDoctorById}