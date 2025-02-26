import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"; 
import { User } from "../models/users.models.js"; 
import mongoose from "mongoose";
import 'dotenv/config'  

export const verifyJWT = asyncHandler(async (req,_, next) => {  // we cn write _ instead of res,req if not used , it is production grade standard practice !
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
        if (!token) {  
            throw new apiError(401,"unauthorized error !") 
        } 
        const decodedToken = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET) 
        const user =  await User.findById(decodedToken?._id).select("-password -refreshToken") 
        if (!user) {  
             throw new apiError(401,"Invalid Access Token") 
        } 
        req.user = user; 
        next();
    }catch (error) {
        throw new apiError(400,error?.message || "Invalid access token")
    }
})  
