import { v2 as cloudinary } from "cloudinary";
import { log } from "console";
import fs from "fs"; // this is a node.js library which helps in managing files(read, write, sync, etc)


// configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_CLOUD_SECRET 
}); 

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null // if there is no local file path then return null
        // upload on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, { // if there is a local file path then upload in cloudinary
            resource_type: "auto"
        })
        // file has been uploaded successfully
        console.log("File has been uploaded on cloudinary", response.url);
        return response
    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temorary file as the upload option got failed
        return null 
    }
}

export { uploadOnCloudinary }