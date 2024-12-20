import mongoose, { Schema } from "mongoose";

const appointmentSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, 
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
    },
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
    },
    date: {
      type: Date,
      required: true,
    },
    timeSlot: {
      type: String, 
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Cancelled", "Completed"],
      default: "Pending",
    },
    reason: {
      type: String, // Optional field for users to specify reasons
      maxlength: 500,
    },
  },
  { timestamps: true }
);

export const Appointment = mongoose.model("Appointment", appointmentSchema);
