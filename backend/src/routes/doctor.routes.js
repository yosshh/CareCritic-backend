import { Router } from "express";
import { getDoctor, getDoctorById, loginDoctor, logoutDoctor, registerDoctor, updateDoctor } from "../controllers/doctor.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";


const router = Router()

router.route("/register").post(
    upload.single("file"),
    registerDoctor
)
router.route("/login").post(loginDoctor)
router.route("/get").get(verifyJWT, getDoctor)
router.route("/logout").get(verifyJWT ,logoutDoctor)
router.route('/getDoctors/:id').get(verifyJWT, getDoctorById)
router.route("/profile/update").post(verifyJWT,upload.single("file"), updateDoctor); 


export default router