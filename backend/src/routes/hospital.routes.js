import { Router } from "express";
import { createHospital, getAllHospitals, updateHospital } from "../controllers/hospital.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()

router.route("/create-hospital").post(verifyJWT, createHospital)
router.route("/get-hospital").get(verifyJWT, getAllHospitals)
router.route("/update/:id").put(verifyJWT, upload.single("file"), updateHospital)

export default router;