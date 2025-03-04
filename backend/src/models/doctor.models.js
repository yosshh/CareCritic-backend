import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const doctorSchema = new Schema(
  {
    contactNumber: {
      type: String, // Changed to String for proper phone number storage
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    fullName: {
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
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    profilePhoto: {
      type: String,
      default: "https://www.example.com/default-profile.png",
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
    availability: [
      {
        day: {
          type: String,
          enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          required: true,
        },
        startTime: {
          type: String,
          required: true,
        },
        endTime: {
          type: String,
          required: true,
        },
      },
    ],
    appointments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Appointment",
      },
    ],
    ratings: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  {
    collection: "doctor",
    timestamps: true,
  }
);

// Password hashing middleware
doctorSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Remove password from JSON responses
doctorSchema.methods.toJSON = function () {
  const doctor = this.toObject();
  delete doctor.password;
  return doctor;
};

// Password comparison
doctorSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Generate Access Token
doctorSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      fullName: this.fullName,
      role: this.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

// Generate Refresh Token
doctorSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      role: this.role,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

// Add Indexes for faster queries
doctorSchema.index({ email: 1 }, { unique: true });
doctorSchema.index({ contactNumber: 1 }, { unique: true });
doctorSchema.index({ role: 1 });

export const Doctor = mongoose.model("Doctor", doctorSchema);
