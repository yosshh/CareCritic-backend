import { Router } from "express";
import { getAllHospitals } from "../controllers/hospital.controller.js";

const router = Router()

router.route("/").get(getAllHospitals)

export default router;