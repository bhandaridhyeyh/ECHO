import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/users.models.js"; 
import ApiResponse from "../utils/apiResponse.js"; 
import { UploadOnCloud } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";  
import 'dotenv/config' 

const sendMessage = asyncHandler(async (req, res) => {  
    const { sender, recipient, message } = req.body; 
    const sendUser = await User.findById(sender) 
    const recipientUser = await User.findById(recipient) 
    if (!sendUser) {  
        throw new apiError(404, "Sender user not found");
    } 
    if (!recipientUser) {  
        throw new apiError(404, "Sender user not found");
    } 
    
})