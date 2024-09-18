import mongoose, { Schema } from "mongoose";

const reviewSchema = new Schema(
    {
        rating: {
            type: Number,
            min: 1,
            max: 5,
            required: true
        },
        comments: {
            type: String,
            maxlength: 1000,
            required: true
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        hospital: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hospital",
            required: true
        },
        date: {
            type: Date,
            default: Date.now
        }
    },
    {timestamps: true}
)

export const Review = mongoose.model("Review", reviewSchema); 