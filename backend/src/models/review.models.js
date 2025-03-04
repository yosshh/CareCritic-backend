import mongoose, { Schema } from "mongoose";

const reviewSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // Reviewer
    },
    entity: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "entityType",
    },
    entityType: {
      type: String,
      enum: ["Doctor", "Hospital"], // Ensures only these two types
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      maxlength: 1000,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Ensure a user can review a hospital or a Doctor only once
reviewSchema.index({ user: 1, entity: 1, entityType: 1 }, { unique: true });

export const Review = mongoose.model("Review", reviewSchema);
