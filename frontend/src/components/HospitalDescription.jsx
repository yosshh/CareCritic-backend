// import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import axios from "axios";
import { HOSPITAL_API_END_POINT } from "@/constants";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { setSingleHospital } from "@/redux/hospitalSlice";
// import { Button } from "./ui/button";
// import { useEffect, useState } from "react";
// import axios from "axios";
// import { JOB_API_END_POINT } from "@/constants";
// import { useDispatch, useSelector } from "react-redux";
// import { APPLICATION_API_END_POINT } from "@/constants";
// import { toast } from "sonner";

const HospitalDescription = () => {
  const dispatch = useDispatch();
  const params = useParams();
  const hospitalId = params.id;
  const { singleHospital } = useSelector((store) => store.hospital);
  const { user } = useSelector((store) => store.auth);
  

  const isBookedAppointment = false;
  // const isIntiallyBookedAppointment =
  //   singleHospital?.appointments?.some(
  //     (application) => application.applicant === user?._id
  //   ) || false;

    // const [isBookedAppointment, setIsBookedAppointment] = useState(isIntiallyApplied);

//   const applyJobHandler = async () => {
//     try {
//       const res = await axios.get(
//         // `${APPLICATION_API_END_POINT}/apply/${jobId}`,
//         { withCredentials: true }
//       );

//       if (res.data.success) {
//         setIsApplied(true); 
//         const updatedSingleJob = {
//           ...singleJob,
//           applications: [...singleJob.applications, { applicant: user?._id }],
//         };
//         dispatch(setSingleJob(updatedSingleJob)); 
//         toast.success(res.data.message);
//       }
//     } catch (error) {
//       console.log(error);
//       toast.error(error.response.data.message);
//     }
//   };

useEffect(() => {
  const fetchSingleHospital = async () => {
    try {
      const res = await axios.get(`${HOSPITAL_API_END_POINT}/getHospital/${hospitalId}`,{withCredentials: true});
      if(res.data.success) {
        dispatch(setSingleHospital(res.data.data))
      }
    } catch (error) {
      console.log(error);
    }
  }
  fetchSingleHospital();
}, [hospitalId, dispatch, user?._id]);

  return (
    <div className="max-w-7xl mx-auto my-10 py-2">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-xl">{singleHospital?.hospitalName}</h1>
          <div className="flex items-center gap-2 mt-4">
            <Badge className={"text-blue-700 font-bold"} variant="ghost">
            {singleHospital?.specializedIn}
            </Badge>
            <Badge className={"text-[#F83002] font-bold"} variant="ghost">
              {/* {singleJob?.jobType} */}
            </Badge>
            <Badge className={"text-[#7209b7] font-bold"} variant="ghost">
              {/* {singleJob?.salary} LPA */}
            </Badge>
          </div>
        </div>
        {/* <Button
          onClick={isApplied ? null : applyJobHandler}
          disabled={isApplied}
          className={`rounded-lg ${
            isApplied
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-[#7209b7] hover:bg-[#5f32ad]"
          }`}
        >
          {isApplied ? "Already Applied" : "Apply Now"}
        </Button> */}
      </div>
      <h1 className="border-b-2 border-b-gray-300 font-medium py-4">
        Hospital Description
      </h1>
      <div className="my-4">
        <h1 className="font-bold my-1">
          Address:{singleHospital?.address}
          <span className="pl-4 font-normal text-gray-800">
            {/* {singleJob?.title} */}
          </span>
        </h1>
        <h1 className="font-bold my-1">
          Contact Number:{singleHospital?.contactNumber}
          <span className="pl-4 font-normal text-gray-800">
            {/* {singleJob?.title} */}
          </span>
        </h1>
        <h1 className="font-bold my-1">
          Website:{" "}
          <span className="pl-4 font-normal text-gray-800">
            {/* {singleJob?.title} */}
          </span>
        </h1>
        <h1 className="font-bold my-1">
          Ratings:{" "}
          <span className="pl-4 font-normal text-gray-800">
            {/* {singleJob?.salary} LPA */}
          </span>
        </h1>
        <Button
          // onClick={isBookedAppointment ? null : applyJobHandler}
          disabled={isBookedAppointment}
          className={`rounded-lg mt-2 ${
            isBookedAppointment
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-[#F83002] hover:bg-[#eb5a64f6]"
          }`}
        >
          {isBookedAppointment ? "Appointment Booked" : "Book Now"}
        </Button>
      </div>
    </div>
  );
};

export default HospitalDescription;
