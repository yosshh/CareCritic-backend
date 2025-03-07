import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

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
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["Hospital"],
      required: true,
    },
    contactNumber: {
      type: Number,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    hospitalLogo: {
      type: String,
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
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    default: [],
    specializedIn: [
      {
        type: String,
        default: "General",
      },
    ],
    appointments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Appointment",
      },
    ],
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

hospitalSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

hospitalSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

hospitalSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      hospitalName: this.hospitalName,
      role: this.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

hospitalSchema.methods.generateRefreshToken = function () {
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

export const Hospital = mongoose.model("Hospital", hospitalSchema);
