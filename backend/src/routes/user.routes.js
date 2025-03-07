import { Router } from "express";
import { loginUser, logoutUser, registerUser, refreshAccessToken, updateAccountDetails } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(
    upload.single("file"),
    registerUser
)

router.route("/login").post(loginUser)

// secured routes
// router.route("/logout").get(verifyJWT ,logoutUser)
router.route("/logout").get(logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/profile/update").post(verifyJWT,upload.single("file"), updateAccountDetails)


export default router