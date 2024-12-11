import { Router } from "express";
import { reviewHospital } from "../controllers/review.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/:id").put(verifyJWT, reviewHospital)

export default router;