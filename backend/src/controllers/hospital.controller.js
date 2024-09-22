import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Hospital } from "../models/hospital.models.js";

const getAllHospitals = asyncHandler( async(req, res)=> {
    const hospitals = await Hospital.find();

    if(!hospitals) {
        throw new ApiError(500, "Something went wrong while fetching hospitals")
    }

    if (hospitals.length === 0) {
        return res.status(404).json(new ApiResponse(404, null, "No hospitals found"));
    }

    return res
    .status(200)
    .json(new ApiResponse(200, hospitals, "hospitals fetched successfully"))
})

export { getAllHospitals }