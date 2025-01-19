
import axios from "axios";
import Navbar from "./shared/Navbar";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Award, Contact, GraduationCap, Mail } from "lucide-react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { DOCTOR_API_END_POINT } from "@/constants";
import { setSingleDoctor } from "@/redux/doctorSlice";



const DoctorCard = () => {
  const dispatch = useDispatch();
  // const isBooked = false;
  const { singleDoctor } = useSelector(store=> store.doctor)
  const params = useParams();
  const doctorId = params.id;

  // const { doctor } = useSelector((store) => store.doctor);
  const { user } = useSelector((store) => store.auth)

  useEffect(() => {
    const fetchSingleDoctor = async () => {
      try {
        const res = await axios.get(`${DOCTOR_API_END_POINT}/getDoctors/${doctorId}`,{withCredentials: true});
        if(res.data.success) {
          dispatch(setSingleDoctor(res.data.data))
        }
      } catch (error) {
        console.log(error);
      }
    }
    fetchSingleDoctor();
  }, [doctorId, dispatch, user?._id]);

  return (
    <div className="bg-[#8FD14F]">
      <Navbar />
      <div className="max-w-4xl mx-auto bg-[#D84040] text-white border border-gray-200 rounded-2xl my-5 p-8">
        <div className="flex justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={singleDoctor?.profilePhoto} alt="profile" />
            </Avatar>
            <div>
              <h1 className="font-medium text-xl">{singleDoctor?.fullName}</h1>
              <p>{singleDoctor?.experienceInYears}+ yrs experience</p>
            </div>
          </div>
        </div>
        <div className="my-5">
          <div className="flex items-center gap-3 my-2">
            <Mail />
            <span>{singleDoctor?.email}</span>
          </div>
          <div className="flex items-center gap-3 my-2">
            <Contact />
            <span>{singleDoctor?.contactNumber}</span>
          </div>
          <div className="flex items-center gap-3 my-2">
            <Award />
            <span>{singleDoctor?.specialty}</span>
          </div>
          <div className="flex items-center gap-3 my-2">
            <GraduationCap />
            <span>{singleDoctor?.qualification}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default DoctorCard;
