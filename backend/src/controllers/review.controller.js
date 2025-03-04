import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import mongoose from "mongoose";
import { Review } from "../models/review.models.js";
import { Hospital } from "../models/hospital.models.js";
import { Doctor } from "../models/doctor.models.js"

const reviewHospital = asyncHandler(async (req, res) => {
    const { comment, rating } = req.body; 
    console.log("Incoming request body:",req.body);
    console.log("Parsed rating:", rating);
    const hospitalId = req.params.id;

      
      const numericRating = Number(rating);
      console.log("Parsed rating:", numericRating);
  
    if (!numericRating || numericRating < 1 || numericRating > 5) {
      throw new ApiError(400, "Rating is required and must be between 1 and 5.");
    }
  
    if (!hospitalId || !mongoose.isValidObjectId(hospitalId)) {
      throw new ApiError(400, 'Invalid Hospital ID.');
    }
  
  
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      throw new ApiError(404, 'Hospital not found.');
    }

     
     const existingReview = await Review.findOne({ entity: hospitalId, user: req.user._id, entityType: "Hospital" });
     if (existingReview) {
         throw new ApiError(400, "You have already reviewed this hospital.");
     }
  
    const newReview = await Review.create({
      entity: hospitalId,
      user: req.user._id, 
      entityType: "Hospital",
      comment,
      rating,
    });
  
    
    const reviews = await Review.find({ entity: hospitalId, entityType: "Hospital" });
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 
    ? reviews.reduce((sum, rev) => sum + (rev.rating || 0),0 ) / totalReviews
    : 0;
  
    hospital.ratings.average = parseFloat(averageRating.toFixed(1));
    hospital.ratings.count = totalReviews;
    
    hospital.reviews.push(newReview._id);
    await hospital.save({ validateBeforeSave: false });

    return res
    .status(201)
    .json(new ApiResponse(200, newReview, "Review to the hospital made."))
  })


  const reviewDoctor = asyncHandler(async (req, res) => {
    try {
      const { comment, rating } = req.body;
      console.log("Incoming request body:", req.body);
  
      
      const numericRating = Number(rating);
      console.log("Parsed rating:", numericRating);
  
      const doctorId = req.params.id;
      console.log(doctorId, "doctorId");
  
      
      if (!numericRating || numericRating < 1 || numericRating > 5) {
        throw new ApiError(400, "Rating is required and must be between 1 and 5.");
      }
  
      
      if (!doctorId || !mongoose.isValidObjectId(doctorId)) {
        throw new ApiError(400, "Invalid Doctor ID.");
      }
  
      
      const doctor = await Doctor.findById(doctorId);
      if (!doctor) {
        throw new ApiError(404, "Doctor not found.");
      }
  
      
      if (!req.user?._id) {
        throw new ApiError(401, "User authentication required.");
      }
  
      
      const existingReview = await Review.findOne({ entity: doctorId, user: req.user._id, entityType: "Doctor" });
      if (existingReview) {
        throw new ApiError(400, "You have already reviewed this Doctor.");
      }
  
      
      const newReview = await Review.create({
        entity: doctorId,
        user: req.user._id, 
        entityType: "Doctor",
        comment,
        rating: numericRating, 
      });
  
      const reviews = await Review.find({ entity: doctorId, entityType: "Doctor" });
      const totalReviews = reviews.length;
      const averageRating =
        totalReviews > 0 ? reviews.reduce((sum, rev) => sum + (rev.rating || 0), 0) / totalReviews : 0;
  
      doctor.ratings.average = parseFloat(averageRating.toFixed(1));
      doctor.ratings.count = totalReviews;
  
      doctor.reviews.push(newReview._id);
      
      await doctor.save({ validateBeforeSave: false });
  
      return res.status(201).json(new ApiResponse(200, newReview, "Review posted successfully."));
    } catch (error) {
      console.error(error);
      return res.status(error.statusCode || 500).json(new ApiError(error.statusCode || 500, error.message));
    }
  });
  

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