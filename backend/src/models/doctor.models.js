import mongoose, { Schema } from "mongoose";

const doctorSchema = new Schema(
  {
    contactNumber: {
      type: Number,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: true,
    },
    role: {
    type: String,
    enum: ["Doctor"],
    required: true,
  },
  email: {
      type: String,
      required: true,
      unique: true,
    },
    isActive: {
      type: Boolean,
      default: true
    },
    profileImage: {
      type: String, // cloudinary url
      default: ""
    },
    specialty: {
      type: String,
      required: true,
    },
    qualification: [
      {
        type: String,
        required: true,
      },
    ],
    experienceInYears: {
      type: Number,
      default: 0,
    },
    worksIn: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hospital",
      },
    ],
    availability: [
      {
        day: {
          type: String,
          required: true
        },
        startTime: { 
          type: String, 
          required: true 
        },
        endTime: { 
          type: String, 
          required: true 
        },
      },
    ],
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
  },
  {
    collection: "doctor",
    timestamps: true,
  }
);
export const Doctor = mongoose.model("Doctor", doctorSchema);
