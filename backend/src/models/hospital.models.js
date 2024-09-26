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
      required: true,
    },
    pincode: {
      type: String,
      required: true,
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
    rating: {
      type: Number,
      required: true
    },
    specializedIn: [
      {
        type: String,
        default: "General",
        required: true,
      },
    ],
  },
  { timestamps: true }
);

export const Hospital = mongoose.model("Hospital", hospitalSchema);
