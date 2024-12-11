import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating Access and Refresh Token"
    );
  }
};

// REGISTER USER
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

  const existedUser = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with this email or username already exists");
  }

  //   const profileImageLocalPath = req.files?.profileImage[0]?.path;
  let profileImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.profileImage) &&
    req.files.profileImage.length > 0
  ) {
    profileImageLocalPath = req.files.profileImage[0].path;
  }

  const profileImage = await uploadOnCloudinary(profileImageLocalPath);

  if (profileImageLocalPath) {
    fs.unlinkSync(profileImageLocalPath); // This will delete the file after uploading it
  }

  const user = await User.create({
    fullName,
    email,
    password,
    profileImage: profileImage?.url || "",
    userName: userName.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

// LOGIN USER
const loginUser = asyncHandler(async (req, res) => {
  // getting data from req body
  // giving access to username or email
  // find the user
  // check the password
  // generating and giving access and refresh token to the user
  // send cookie

  const { email, userName, password } = req.body;

  if (!(userName || email)) {
    throw new ApiError(400, "username or email is required."); // giving access to username or email
  }

  const user = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          refreshToken,
          accessToken,
        },
        `User Logged In successfully, welcome back ${user.fullName} `
      )
    );
});

const getUserProfile = asyncHandler(async (req, res) => {
  res.status(200)
  .json(
    new ApiResponse(
      200,
      {
      success: true,
      user: req.user,
      },
    )
)})


// LOGOUT USER
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined
      }
    },{
      new: true
    }
  )

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
  .status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken", options)
  .json(new ApiResponse(200, {}, "User logged out"))
});

const refreshAccessToken = asyncHandler (async (req, res)=> {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

  if(!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request")
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    )
  
    const user = await User.findById(decodedToken?._id)
  
    if(!user) {
      throw new ApiError(401, "Invalid Refresh Token")
    }
  
    if(incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh Token is expired or used")
    }
  
    const options = {
      httpOnly: true,
      secure: true
    }
  
    const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user._id)
  
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
      new ApiResponse(
        200,
        {accessToken, refreshToken: newRefreshToken},
        "Access Token refreshed"
      )
    )
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh Token")
  }
});


const updateAccountDetails = asyncHandler(async (req, res) => {
  try {
    const userId = req.user?._id; // Ensure userId is retrieved from authenticated request
    const { fullName, email } = req.body;

    if (!fullName || !email) {
      throw new ApiError(400, "All fields are required");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ApiError(400, "Invalid email format");
    }

    let profileImage;

    // Handle profile image upload if provided
    if (req.files?.profileImage?.[0]?.path) {
      const profilePhoto = await uploadOnCloudinary(req.files.profileImage[0].path);

      if (!profilePhoto.url) {
        throw new ApiError(400, "Error while uploading image");
      }

      profileImage = profilePhoto.url;

      // Optionally, delete the local file after upload
      fs.unlinkSync(req.files.profileImage[0].path);
    }

    // Update user details
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          fullName,
          email,
          ...(profileImage && { profileImage }), // Conditionally include profileImage
        },
      },
      {
        new: true,
      }
    ).select("-password");

    if (!updatedUser) {
      throw new ApiError(404, "User not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, updatedUser, "Account details updated successfully"));
  } catch (error) {
    // Log the error and return an appropriate response
    console.error("Error updating account details:", error);
    throw new ApiError(error.status || 500, error.message || "An unexpected error occurred");
  }
});




export { registerUser, loginUser, logoutUser, refreshAccessToken, updateAccountDetails, getUserProfile };