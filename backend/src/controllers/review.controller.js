import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import mongoose from "mongoose";
import { Review } from "../models/review.models.js";
import { Hospital } from "../models/hospital.models.js";
import { Doctor } from "../models/doctor.models.js"

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

     // Check if user has already reviewed the hospital
     const existingReview = await Review.findOne({ entity: hospitalId, user: req.user._id, entityType: "Hospital" });
     if (existingReview) {
         throw new ApiError(400, "You have already reviewed this hospital.");
     }
  
    // Save the review
    const newReview = await Review.create({
      entity: hospitalId,
      user: req.user._id, // Assuming you have user information from authentication middleware
      entityType: "Hospital",
      comments,
      rating,
    });
  
    // Optionally, update the hospital's average rating
    const reviews = await Review.find({ entity: hospitalId, entityType: "Hospital" });
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 
    ? reviews.reduce((sum, rev) => sum + (rev.rating || 0),0 ) / totalReviews
    : 0;
  
    hospital.ratings.average = parseFloat(averageRating.toFixed(1));
    hospital.ratings.count = totalReviews;
    

    await hospital.save({ validateBeforeSave: false });

    return res
    .status(201)
    .json(new ApiResponse(200, newReview, "Review to the hospital made."))
  })


  const reviewDoctor = asyncHandler(async (req, res) => {
    const { comments, rating } = req.body; 
    console.log("Incoming request body:",req.body);
    console.log("Parsed rating:", rating);
    const doctorId = req.params.id;
  
    // Validate input
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
        throw new ApiError(400, 'Rating is required and must be between 1 and 5.');
      }
  
    if (!doctorId || !mongoose.isValidObjectId(doctorId)) {
      throw new ApiError(400, 'Invalid Doctor ID.');
    }
  
    // Check if doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      throw new ApiError(404, 'Doctor not found.');
    }

     // Check if user has already reviewed the doctor
     const existingReview = await Review.findOne({ entity: doctorId, user: req.user._id, entityType: "Doctor" });
     if (existingReview) {
         throw new ApiError(400, "You have already reviewed this Doctor.");
     }
  
    // Save the review
    const newReview = await Review.create({
      entity: doctorId,
      user: req.user._id, // Assuming you have user information from authentication middleware
      entityType: "Doctor",
      comments,
      rating,
    });
  
    // Optionally, update the doctor's average rating
    const reviews = await Review.find({ entity: doctorId, entityType: "Doctor" });
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 
    ? reviews.reduce((sum, rev) => sum + (rev.rating || 0),0 ) / totalReviews
    : 0;
  
    doctor.ratings.average = parseFloat(averageRating.toFixed(1));
    doctor.ratings.count = totalReviews;
    

    await doctor.save({ validateBeforeSave: false });

    return res
    .status(201)
    .json(new ApiResponse(200, newReview, "Review to the doctor made."))
  })

const getReviews = asyncHandler(async (req, res) => {
    try {
      const { entityId, entityType } = req.params; // Get ID and type (Doctor/Hospital)
  
      if (!entityId || !entityType) {
        throw new ApiError(400, "Entity ID and Entity Type are required.");
      }
  
      // Find reviews for the specified doctor or hospital
      const reviews = await Review.find({ entity: entityId, entityType })
        .populate("user", "fullName email") // Populate user details
        .sort({ createdAt: -1 }); // Sort by latest first
  
      return res.status(200).json(new ApiResponse(200, reviews, "Reviews fetched successfully."));
    } catch (error) {
      console.error(error);
      return res.status(500).json(new ApiError(500, "Failed to fetch reviews."));
    }
});

export { reviewHospital, reviewDoctor, getReviews}