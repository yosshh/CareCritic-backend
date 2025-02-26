import { Router } from "express";
import { reviewDoctor, reviewHospital, getReviews } from "../controllers/review.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/hospital/:id").put(verifyJWT, reviewHospital)
router.route("/doctor/:id").put(verifyJWT, reviewDoctor)
router.route("/reviews/:entityId/:entityType").get(getReviews);


export default router;