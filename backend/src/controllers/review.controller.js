import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { Review } from "../models/review.models.js";
import { Hospital } from "../models/hospital.models.js";

const reviewHospital = asyncHandler(async (req, res) => {
    const { comments, rating } = req.body; 
    console.log("Incoming request body:",req.body);
    console.log("Parsed rating:", rating);
    const hospitalId = req.params.id;
  
    // Validate input
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
        throw new ApiError(400, 'Rating is required and must be between 1 and 5.');
      }
  
    if (!hospitalId || !mongoose.isValidObjectId(hospitalId)) {
      throw new ApiError(400, 'Invalid Hospital ID.');
    }
  
    // Check if hospital exists
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      throw new ApiError(404, 'Hospital not found.');
    }
  
    // Save the review
    const newReview = await Review.create({
      hospital: hospitalId,
      user: req.user._id, // Assuming you have user information from authentication middleware
      comments,
      rating,
    });
  
    // Optionally, update the hospital's average rating
    const reviews = await Review.find({ hospital: hospitalId });
    const averageRating =
      reviews.reduce((sum, rev) => sum + rev.rating, 0) / reviews.length;
  
    hospital.averageRating = averageRating.toFixed(1); // Save one decimal point
    await hospital.save();
  
    return res.status(201).json({
      success: true,
      message: 'Review added successfully.',
      review: newReview,
    });
  });

export { reviewHospital }