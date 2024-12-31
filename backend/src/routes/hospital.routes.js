import { Router } from "express";
import { createHospital, loginHospitals, updateHospital } from "../controllers/hospital.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()

router.route("/create-hospital").post(createHospital)
router.route("/get-hospital").get(loginHospitals)
router.route("/update/:id").put(verifyJWT, upload.single("file"), updateHospital)
// router.route("/review/:id").put(verifyJWT, reviewHospital)

export default router;