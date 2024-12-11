import mongoose, { Schema } from "mongoose";

const doctorSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    qualification: [
        {
            type: String,
            required: true
        }
    ],
    experienceInYears: {
        type: Number,
        default: 0
    },
    worksIn: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hospital"
        }
    ]
  },
  {
    timestamps: true,
  }
);

export const Doctor = mongoose.model("Doctor", doctorSchema);
