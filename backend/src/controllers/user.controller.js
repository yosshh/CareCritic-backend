import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const registerUser = asyncHandler(async (req, res) => {
  // get user validation from frontend
  // check if all fields are not empty
  // check if email is original
  // check if user already exists: email, username
  // check for profileImage
  // upload them on cloudinary
  // create user object - create entry on db
  // remove password and refresh token field from response
  // check for user creation
  // return res

  const { userName, fullName, password, email } = req.body;

  if (
    [fullName, email, userName, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Check if the email format is valid
  if (!emailRegex.test(email)) {
    throw new ApiError(400, "Invalid email format");
  }

  const existedUser = User.findOne({
    $or: [{ userName }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with this email or username already exists");
  }

  const profileImageLocalPath = req.files?.profileImage[0]?.path;

  const profileImage = await uploadOnCloudinary(profileImageLocalPath)

  const user = await User.create({
    fullName,
    email,
    password,
    profileImage: profileImage?.url || "",
    userName: userName.toLowerCase()
  })

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )

  if(!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user")
  }

  return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered successfully")
  )

});

export { registerUser };