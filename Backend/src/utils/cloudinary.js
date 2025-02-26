import { v2 as cloudinary } from "cloudinary"; 
import fs from "fs"; 
import { apiError } from "./apiError.js";  
import 'dotenv/config' 

if (!process.env.CLOUD_NAME || !process.env.API_KEY || !process.env.API_SECRET) {
    throw new apiError(500,"Cloudinary configuration error: Ensure CLOUD_NAME, API_KEY, and API_SECRET are set in the environment variables.");
}
cloudinary.config({ 
    cloud_name:process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET
});
// function to upload file on cloudinary
const UploadOnCloud = async (localfilepath) => { 
    try {
        if (!localfilepath) { return null } 
        const response = await cloudinary.uploader.upload(localfilepath, { 
            resource_type:"auto"
        })  
        console.log("file is uploaded successfully on cloudnairy") 
        //console.log(response.url) 
        fs.unlinkSync(localfilepath)
        return response  
    } catch (error){
        fs.unlinkSync(localfilepath) // deletes file by removing linking path ! 
        return null 
    }
} 
// function to delete from the cloundinary 
const DeleteOnCloud = async (cloudUrl) => {      

    if (!cloudUrl) {
            return nulll
       } 
    const response = await cloudinary.uploader.destroy(cloudUrl, (error, result) => { 
        if (error) { 
            console.log(error)
            throw new apiError(501, "Failed to delete from the cloud")
        }
        else {  
            return result
        }
     })
    console.log(response)
    return response 
}
export { UploadOnCloud,DeleteOnCloud } 
