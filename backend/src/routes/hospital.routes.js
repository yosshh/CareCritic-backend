import { Router } from "express";
import { createHospital, getHospitals, loginHospitals, logoutHospital, updateHospital } from "../controllers/hospital.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()

router.post('/register', upload.single('file'), createHospital);
router.route("/get").get(getHospitals)
router.route("/login").post(loginHospitals)
router.route("/logout").get(verifyJWT ,logoutHospital)
router.route("/update/:id").put(verifyJWT, upload.single("file"), updateHospital)
// router.route("/review/:id").put(verifyJWT, reviewHospital)

export default router;