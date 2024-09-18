import mongoose, { Schema } from "mongoose";

const hospitalSchema = new Schema(
  {
    hospitalName: {
      type: String,
      required: true,
      unique: true,
    },
    addressLine1: {
      type: String,
      required: true,
    },
    addressLine2: {
      type: String,
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
      type: Number,
      required: true,
    },
    hospitalEmail: {
      type: String,
      required: true,
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
