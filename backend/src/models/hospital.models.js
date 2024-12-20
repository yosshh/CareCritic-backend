import mongoose, { Schema } from "mongoose";

const hospitalSchema = new Schema(
  {
    hospitalName: {
      type: String,
      required: true,
      unique: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
    },
    role: {
    type: String,
    enum: ["Hospital"],
    required: true,
  },
    pincode: {
      type: String,
    },
    ContactNumber: {
      type: String,
      required: true,
    },
    hospitalEmail: {
      type: String,
      required: true,
    },
    hospitalImage: {
      type: String,
    },
    ratings: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    reviews: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        comment: { type: String },
        rating: { type: Number, min: 1, max: 5 },
        date: { type: Date, default: Date.now },
      },
    ],
    specializedIn: [
      {
        type: String,
        default: "General",
      },
    ],
  },
  { timestamps: true }
);

export const Hospital = mongoose.model("Hospital", hospitalSchema);
