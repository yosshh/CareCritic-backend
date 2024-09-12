import mongoose, { Schema } from "mongoose";

const doctorSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        qualification: {
            type: String,
            required: true
        },
        exprerience: {
            type: Number,
            default: 0
        }
    }, {
        timestamps: true
    }
)

export const Doctor = mongoose.model("Doctor", doctorSchema);