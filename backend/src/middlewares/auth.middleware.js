import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";
import { Doctor } from "../models/doctor.models.js";
import { Hospital } from "../models/hospital.models.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    // Retrieve token from cookies or Authorization header
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Access token is missing.");
    }

    // Verify and decode the token
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Determine the model based on the role
    let user;
    if (decodedToken.role === "Hospital") {
      user = await Hospital.findById(decodedToken._id).select("-password -refreshToken");
      req.hospital = user; // Attach hospital to req for downstream use
    } else if (decodedToken.role === "Doctor") {
      user = await Doctor.findById(decodedToken._id).select("-password -refreshToken");
      req.doctor = user; // Attach doctor to req for downstream use
    } else if (decodedToken.role === "User") {
      user = await User.findById(decodedToken._id).select("-password -refreshToken");
      req.user = user; // Attach user to req for downstream use
    }

    if (!user) {
      throw new ApiError(401, "Invalid access token. User not found.");
    }

    // Attach role and user details to the request object
    req.role = decodedToken.role;
    req.user = user;
    next();
  } catch (error) {
    // Handle specific JWT errors
    if (error.name === "JsonWebTokenError") {
      throw new ApiError(401, "Invalid access token.");
    } else if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Access token has expired.");
    }
    throw new ApiError(401, error.message || "Unauthorized request.");
  }
});
