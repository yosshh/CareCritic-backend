import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { bookDoctorAppointment, bookHospitalAppointment, getAppliedAppointments, getDoctorAppointments, getHospitalAppointments, updateStatus } from "../controllers/appointment.controller.js";

const router = Router();

router.route("/bookDoctor/:id").post(verifyJWT, bookDoctorAppointment);
router.route("/bookHospital/:id").post(verifyJWT, bookHospitalAppointment);
router.route("/bookings/").get(verifyJWT, getAppliedAppointments); 
router.route("/doctor/appointments/:id").get(verifyJWT, getDoctorAppointments); 
router.route("/hospital/appointments/:id").get(verifyJWT, getHospitalAppointments); 
router.route("/:id/statusUpdate").patch(verifyJWT, updateStatus);



export default router;
