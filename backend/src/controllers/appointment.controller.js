import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Appointment } from "../models/appointment.models.js";
import { Doctor } from "../models/doctor.models.js";
import { Hospital } from "../models/hospital.models.js";



const bookDoctorAppointment = asyncHandler(async (req, res) => {
  const doctorId = req.params.id;
  const userId = req.user._id; // Ensure authentication middleware populates req.user
  const { timeSlot, date, reason } = req.body;
  console.log('Cookies:', req.cookies);
  

  // Validate required fields
  if (!doctorId) {
    throw new ApiError(400, "Doctor ID is required.");
  }
  if (!date || !timeSlot) {
    throw new ApiError(400, "Date and time slot are required.");
  }

  // Check for existing appointment
  const existingAppointment = await Appointment.findOne({
    doctor: doctorId,
    user: userId,
  });
  if (existingAppointment) {
    throw new ApiError(400, "You have already booked an appointment.");
  }

  // Create a new appointment
  const newAppointment = await Appointment.create({
    doctor: doctorId,
    user: userId,
    date,
    timeSlot,
    reason,
  });

  // Add appointment to doctor's record
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    throw new ApiError(404, "Doctor not found.");
  }
  doctor.appointments.push(newAppointment._id);
  await doctor.save();

  // Respond with success
  return res
    .status(201)
    .json(new ApiResponse(201, newAppointment, "Appointment booked successfully."));
});

const getAppliedAppointments = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch all appointments for the user
    const appointments = await Appointment.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('doctor')
      .populate('hospital');

    if (!appointments || appointments.length === 0) {
      throw new ApiError(404, "No appointments found.");
    }

    // Separate appointments by type
    const doctorAppointments = appointments.filter((appt) => appt.doctor);
    const hospitalAppointments = appointments.filter((appt) => appt.hospital);

    return res.status(200).json(
      new ApiResponse(200, { 
        doctorAppointments, 
        hospitalAppointments 
      }, "Appointments fetched successfully.")
    );
  } catch (error) {
    console.error(error);
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode || 500, error.message));
  }
});


const bookHospitalAppointment = asyncHandler(async (req, res) => {
    const hospitalId = req.params.id;
    const userId = req.user._id; // Ensure authentication middleware populates req.user
    const { timeSlot, date, reason } = req.body;
  
    // Validate required fields
    if (!hospitalId) {
      throw new ApiError(400, "Hospital ID is required.");
    }
    if (!date || !timeSlot) {
      throw new ApiError(400, "Date and time slot are required.");
    }
  
    // Check for existing appointment
    const existingAppointment = await Appointment.findOne({
      hospital: hospitalId,
      user: userId,
      date,
      timeSlot,
    });
    if (existingAppointment) {
      throw new ApiError(400, "You have already booked an appointment for this time slot.");
    }
  
    // Create a new appointment
    const newAppointment = await Appointment.create({
      hospital: hospitalId,
      user: userId,
      date,
      timeSlot,
      reason,
    });
  
    // Add appointment to hospital's record
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      throw new ApiError(404, "Hospital not found.");
    }
    hospital.appointments.push(newAppointment._id);
    await hospital.save();
  
    // Respond with success
    return res
      .status(201)
      .json(new ApiResponse(201, newAppointment, "Appointment booked successfully."));
});


const getDoctorAppointments = asyncHandler(async (req, res) => {
  try {
    const doctorId = req.params.id;

    // Fetch the doctor with populated appointments
    const doctor = await Doctor.findById(doctorId).populate({
      path: 'appointments',
      options: { sort: { createdAt: -1 } }, // Sort appointments by creation time
      populate: { path: 'user', select: 'name email' }, // Populate user details
    });

    if (!doctor) {
      throw new ApiError(404, "Doctor not found.");
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        doctor.appointments,
        "Appointments fetched successfully."
      )
    );
  } catch (error) {
    console.error(error);
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode || 500, error.message));
  }
});


const getHospitalAppointments = asyncHandler(async (req, res) => {
  try {
    const hospitalId = req.params.id;

    // Fetch the hospital with populated appointments
    const hospital = await Hospital.findById(hospitalId).populate({
      path: 'appointments',
      options: { sort: { createdAt: -1 } }, // Sort appointments by creation time
      populate: { path: 'user', select: 'name email' }, // Populate user details
    });

    if (!hospital) {
      throw new ApiError(404, "Hospital not found.");
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        hospital.appointments,
        "Appointments fetched successfully."
      )
    );
  } catch (error) {
    console.error(error);
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode || 500, error.message));
  }
});


const updateStatus = asyncHandler(async (req, res) => {
  try {
    console.log("Inside updateStatus");

    const { status } = req.body;
    const appointmentId = req.params.id;

    // Validate if status is provided
    if (!status) {
      throw new ApiError(400, "Status is required.");
    }

    // Find appointment by ID
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      throw new ApiError(404, "Appointment not found.");
    }

    // Update the status
    appointment.status = status;
    await appointment.save();

    return res
      .status(200)
      .json(new ApiResponse(200, appointment, "Status updated successfully."));
  } catch (error) {
    console.error(error);
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode || 500, error.message));
  }
});


export { bookHospitalAppointment, getAppliedAppointments, bookDoctorAppointment, getDoctorAppointments, getHospitalAppointments, updateStatus };
