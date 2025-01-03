import { Router } from "express";
import { loginDoctor, registerDoctor, updateDoctor } from "../controllers/doctor.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";


const router = Router()

router.route("/register").post(
    upload.single("file"),
    registerDoctor
)
router.route("/login").get(loginDoctor)
router.route("/profile/update").post(verifyJWT,upload.single("file"), updateDoctor); 


export default router