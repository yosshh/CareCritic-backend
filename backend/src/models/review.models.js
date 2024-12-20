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
      required: true, // Could be a Doctor or Hospital ID
    },
    entityType: {
      type: String,
      enum: ["Doctor", "Hospital"], // To distinguish what is being reviewed
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
reviewSchema.index({ user: 1, hospital: 1 }, { unique: true });

export const Review = mongoose.model("Review", reviewSchema);
