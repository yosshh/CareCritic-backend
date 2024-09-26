import { v2 as cloudinary } from "cloudinary";
import fs from "fs"; // this is a node.js library which helps in managing files(read, write, sync, etc)
import dotenv from "dotenv";
dotenv.config();


// configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_CLOUD_SECRET,
}); 

const uploadOnCloudinary = async (localFilePath) => {
    console.log(process.env.CLOUDINARY_CLOUD_NAME, process.env.CLOUDINARY_API_KEY, process.env.CLOUDINARY_API_KEY);
    
    try {
        if(!localFilePath) return null // if there is no local file path then return null
        // upload on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, { // if there is a local file path then upload in cloudinary
            resource_type: "image",
        });
        console.log("upload response: ", response);
        
        // file has been uploaded successfully
        console.log("File has been uploaded on cloudinary", response.url);
        fs.unlinkSync(localFilePath)
        return response
    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temorary file as the upload option got failed
        console.log("error uploading to cloudinary", error);
        
        return null 
    }
}

export { uploadOnCloudinary }