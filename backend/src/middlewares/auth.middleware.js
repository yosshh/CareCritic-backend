import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";
import { Doctor } from "../models/doctor.models.js";
import { Hospital } from "../models/hospital.models.js";

// Dynamic model selection based on role
export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
      const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
      
      if (!token) {
        throw new ApiError(401, "Unauthorized Request");
      }
  
      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  
      let user;
      if (decodedToken.role === 'Hospital') {
        user = await Hospital.findById(decodedToken._id).select("-password -refreshToken");
      } else if (decodedToken.role === 'Doctor') {
        user = await Doctor.findById(decodedToken._id).select("-password -refreshToken");
      } else {
        user = await User.findById(decodedToken._id).select("-password -refreshToken");
      }
  
      if (!user) {
        throw new ApiError(401, "Invalid Access Token");
      }
  
      req.user = user;
      req.role = decodedToken.role;  // Store role in req for later use
      next();
    } catch (error) {
      throw new ApiError(401, error?.message || "Invalid access token");
    }
  });
  