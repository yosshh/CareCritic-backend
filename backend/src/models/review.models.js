import mongoose, { Schema } from "mongoose";

const reviewSchema = new Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
      default: 0,
    },
    comments: {
      type: String,
      maxlength: 1000,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },
    helpful: {
      type: Number,
      default: 0, // Optional field to track "helpful" votes
    },
  },
  { timestamps: true }
);

// Ensure a user can review a hospital only once
reviewSchema.index({ user: 1, hospital: 1 }, { unique: true });

export const Review = mongoose.model("Review", reviewSchema);
