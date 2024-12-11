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
    pincode: {
      type: String,
    },
    ContactNumber: {
      type: String,
      required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    hospitalEmail: {
      type: String,
      required: true,
    },
    hospitalImage: {
      type: String,
    },
    password: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      default: 0,
    },
    specializedIn: [
      {
        type: String,
        default: "General"
      },
    ],
  },
  { timestamps: true }
);

export const Hospital = mongoose.model("Hospital", hospitalSchema);
