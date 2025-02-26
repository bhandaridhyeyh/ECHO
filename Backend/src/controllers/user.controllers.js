import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/users.models.js"; 
import ApiResponse from "../utils/apiResponse.js"; 
import { UploadOnCloud } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";  
import 'dotenv/config'

const genrateAccessTokenandRefreshToken = async function (userId) {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new apiError(404, "User not created !!")
        }
        const accessToken = user.genrateAccessTokens();
        const refreshToken = user.genrateRefreshTokens();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false }); // saving without the validation
        return { accessToken, refreshToken };
     
    } catch (error) {
        throw new apiError(505, "something went wrong while genrating the tokens");
    }
}
const registerUser = asyncHandler(async (req, res) => {  
    console.log(req.boby) 
    console.log(req.headers)
    const {email, password} = req.body
        // check for images and files 
        // upload images or files to cloud 
        // store them in data base by creating an data entry in mongo is done by creating an object    
        // remove password and refresh token from response   
    if (email === "" || password === ""){  
        throw new apiError(404,"email or password is empty !") 
    } 
    if (!email.includes("@nuv.ac.in")) { 
        throw new apiError(400,"give a proper email!");
    }  
    const existed_user = await User.findOne({ email })  
    
    if (existed_user) {  
      throw new apiError(409,"a user already exists")
    }  
    const user = await User.create({ email, password })  
    const { accessToken, refreshToken } = await genrateAccessTokenandRefreshToken(user._id);
    const options = {
        // options needs to desgin to send cookies!
        httpsOnly: true,
        secure: true,
    }; 
    const userCreated = await User.findById(user._id).select("-password -refreshToken")
    if (!userCreated) {  
            throw new apiError(500,"something went wrong while registering the user") 
    }
    return res.status(201) 
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(201,{
        userCreated,
        accessToken,
        refreshToken,
    }, "successfull user creation and & login !"))
}) 
const complete_profile = asyncHandler(async (req, res) => {  
    const { enrollmentId, enrollmentYear, gender, university, course, program,fullName } = req.body  
    if ([enrollmentId, enrollmentYear, gender, university, course, program,fullName].some((i) => i == null || (typeof i === 'string' && i.trim() === ""))) {  
        throw new apiError(401, "One of the required fields is missing or empty!");
    } 
    let ProfilePicturelocalpath  
    console.log(req.file)
    if (req.file){
        ProfilePicturelocalpath = req.file.path; 
    }  
    console.log(ProfilePicturelocalpath)
    if (!ProfilePicturelocalpath) {
        throw new apiError(400, "ProfilePIcture is required !");
      }
    const ProfilePicture = await UploadOnCloud(ProfilePicturelocalpath);
      if (!ProfilePicture) {
        throw new apiError(400, "ProfilePicture is required !");
      }

    const user = await User.findByIdAndUpdate(req.user._id, { 
        enrollmentId,
        enrollmentYear,
        gender, 
        ProfilePicture:ProfilePicture?.url,
        university,
        course,
        program, 
        fullName
    })
    if (!user) {  
        throw new apiError(501,"User failed to complete profile !")
    } 
    const updateUser = await User.findById(user._id).select("-password -refreshToken")
    return res.status(200).json(new ApiResponse(200,updateUser,"User profile compeleted !"))
})  

const loginUser = asyncHandler(async (req, res) => {
        // get details username and password thorugh req.body
        // validation that user of username exists or not ,
        // password is correct or not
        // genrate the access token and referesh token
        // sent cookies and sent response
      
        const { email, password } = req.body; // destructing data
      
        if ([email, password].some((i) => i?.trim() === "")) {
          throw new apiError(400, "the Username or Password is empty");
        }
        const user = await User.findOne({ email }); // query to find user from username & to  return the user instance !!!!!
      
        if (!user) {
          throw new apiError(409, "the Email doesn't exists");
        }
      
        const password_valid = await user.isPasswordCorrect(password);
      
        if (!password_valid) {
          throw new apiError(401, "invalid usercredentials !");
        }
        const { accessToken, refreshToken } = await genrateAccessTokenandRefreshToken(
          user._id
        );
        user.refreshToken = refreshToken;
        const userObject = user.toObject(); // converted into object
        delete userObject.password; // deleting password flied before sending to user
        const options = {
          // options needs to desgin to send cookies!
          httpsOnly: true,
          secure: true,
        };
        return res
          .status(200)
          .cookie("accessToken", accessToken, options)
          .cookie("refreshToken", refreshToken, options)
          .json(
            new ApiResponse(
              200,
              {
                userObject,
                accessToken,
                refreshToken,
              },
              "User Logged In !"
            )
          );
      });
      
const logoutUser = asyncHandler(async (req, res) => {
        // run the authentication middleware to get user id
        // remove access and refresh token , also from the database
        //
        await User.findByIdAndUpdate(
          req.user._id,
          { $set: { refreshToken: undefined } },
          { new: true }
        ); // set operator sets the particular value
        const options = {
          // options needs to desgin to send cookies!
          httpsOnly: true,
          secure: true,
        };
        return res
          .status(200)
          .clearCookie("accessToken", options)
          .clearCookie("refreshToken", options)
          .json(new ApiResponse(200, {}, "User logged out !"));
});  
const GetUserProfile = asyncHandler(async (req, res) => {  
  // to get all user detailes and user's sell posts 
  const user = User.findById(req.user?._id).select("-password -refreshToken").populate('userSellpost').exec((err, user) => {  
    if (err) {  
      throw new apiError(501,err)
    } 
    console.log(user)
  })  
  if (!user) { 
    throw new apiError(404,"User not Found !") 
  }  
  return res.status(200).json(new ApiResponse(201,))
})
const updateAccountDetails = asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      throw new apiError(401, "email not found");
    }
    const user = await User.findByIdAndUpdate(
      req.user?._id,
      { $set: { email: email } },
      { new: true } // it will return updated user
    ).select("email");

    if (!user) {
      throw new apiError(404, "User not found");
    }
    return res
      .status(200)
      .json(new ApiResponse(201, user, "email changed successfully!"));
  } catch (error) {
    throw new apiError(402, "something went wrong during changing email");
  }
}); 
const DeleteUser = asyncHandler(async (req, res) => {
  const { password } = req.body;
  if (!password) {
    throw new apiError(400, "Password required !");
  }
  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new apiError(401, "User not Found !");
  }
  const verifyPassword = await user.isPasswordCorrect(password);
  if (!verifyPassword) {
    throw new apiError(405, "Invalid password !");
  }
  const ProfilePictureUrl = user.ProfilePicture;
  const ProfilePictureId = ProfilePictureUrl.match(/\/([a-z0-9]+)\.jpg$/);
  const deleteProfilePictureOnCloud = await DeleteOnCloud(ProfilePictureId[1]);
  if (!deleteProfilePictureOnCloud) {
    throw new apiError(501, "failed to delete file from cloud !");
  }
  const deleteduser = await User.findByIdAndDelete(req.user?._id);
  if (!deleteduser) {
    throw new apiError(401, "User not deleted!");
  }
  return res
    .status(200)
    .json(new ApiResponse(201, deleteduser, "user deleted successfully"));
});
export { registerUser,complete_profile,loginUser,logoutUser,DeleteUser,GetUserProfile}