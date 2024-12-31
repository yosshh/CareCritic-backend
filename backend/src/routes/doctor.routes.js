import { Router } from "express";
import { registerDoctor } from "../controllers/doctor.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";


const router = Router()

router.route("/register").post(
    upload.single("file"),
    registerDoctor
)