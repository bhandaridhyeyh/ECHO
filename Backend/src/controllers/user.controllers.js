import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/users.models.js";
import ApiResponse from "../utils/apiResponse.js";
import { UploadOnCloud } from "../utils/cloudinary.js";
import nodemailer from 'nodemailer';
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

const otpStore = {}; // In-memory OTP storage for demo
const transporter = nodemailer.createTransport({
  secure: true,
  host: 'smtp.gmail.com',
  port: 465,
  auth: {
    user: 'debuggironman@gmail.com',
    pass: process.env.GOOGLE_KEY
  }
})


const sendotp = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  if (email === "" || password === "") {
    throw new apiError(404, "email or password or enrollmentId is empty !")
  }
  if (!email.includes("@nuv.ac.in")) {
    throw new apiError(400, "give a proper email!");
  }
  const existed_user = await User.findOne({ email })
  if (existed_user) {
    throw new apiError(409, "a user already exists")
  }
  const otp = Math.floor(100000 + Math.random() * 900000);
  otpStore[email] = {
    otp,
    password,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 min
  };
  const mailOptions = {
    from: "debuggironman@gmail.com",
    to: email,
    subject: "Test email!",
    text: `Your OTP is: ${otp}`,
  }
  try {
    const info = await transporter.sendMail(mailOptions);
    return res.status(200).json(new ApiResponse(201, null, "Email sent successfully"));
  } catch (error) {
    console.log(error);
    throw new apiError(500, "Failed to send email!");
  }
});

const registerUser = asyncHandler(async (req, res) => {
  const { email, otp } = req.body

  if (!otpStore || Date.now() > otpStore.expiresAt) {
    throw new apiError(401, "OTP expired or invalid.");
  }
  if (parseInt(otp) !== otpStore[email]?.otp) {
    throw new apiError(402, "Wrong OTP.");
  }

  // const a = email.split("@") 

  // const fullName = a[0].replace(/\./g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) 
  const password = otpStore[email]?.password
  const user = await User.create({ email, password })

  const { accessToken, refreshToken } = await genrateAccessTokenandRefreshToken(user._id);

  const options = {
    // options needs to desgin to send cookies!
    httpsOnly: true,
    secure: true,
  };
  const userCreated = await User.findById(user._id).select("-password -refreshToken")
  if (!userCreated) {
    throw new apiError(500, "something went wrong while registering the user")
  }
  return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, {
      userCreated,
      accessToken,
      refreshToken,
    }, "successfull user creation and & login !"))
})

const complete_profile = asyncHandler(async (req, res) => {  
    const { fullName,enrollmentYear, university, course, program,contactNumber} = req.body  
    if ([enrollmentYear, university, course,program,contactNumber].some((i) => i == null || (typeof i === 'string' && i.trim() === ""))) {  
        throw new apiError(401, "One of the required fields is missing or empty!");
    } 
  const normalizedData = { 
      fullName : fullName,
      enrollmentYear: enrollmentYear.trim(),
      university: university.trim().toUpperCase(), 
      course: course.trim().toUpperCase(),
      program: program.trim().toUpperCase(), 
      contactNumber: validateAndNormalizeContactNumber(contactNumber)
  };

  function validateAndNormalizeContactNumber(contactNumber) {
    // Remove all non-digit characters (spaces, dashes, parentheses, etc.)
    const normalizedContact = contactNumber.replace(/\D/g, '');
    // Check if it is exactly 10 digits (you can change this rule based on your region)
    if (normalizedContact.length !== 10) {
      throw new apiError(400, "Contact number must be exactly 10 digits.");
    }
    return normalizedContact;
  }

  const user = await User.findByIdAndUpdate(req.user._id, normalizedData, { new: true }) // new : true gives new upadtes document !
  if (!user) {
    throw new apiError(501, "User failed to complete profile !")
  }
  const updateUser = await User.findById(user._id).select("-password -refreshToken")
  return res.status(200).json(new ApiResponse(200, updateUser, "User profile compeleted !"))
})

const updateUserProfilePicture = asyncHandler(async (req, res) => {
  try {

    let ProfilePicturelocalpath
    console.log(req.file)

    if (req.file) {
      ProfilePicturelocalpath = req.file.path;
    }
    console.log(ProfilePicturelocalpath)

    if (!ProfilePicturelocalpath) {
      throw new apiError(400, "ProfilePIcture is required !");
    }
    const ProfilePictureCloud = await UploadOnCloud(ProfilePicturelocalpath);

    if (!ProfilePictureCloud) {
      throw new apiError(500, "Failed to upload the Cloud !");
    }
    const Pp_url = ProfilePictureCloud.secure_url || ProfilePictureCloud.url
    const user = await User.findByIdAndUpdate(req.user?._id, { $set: { ProfilePicture: Pp_url } }, { new: true }).select('ProfilePicture')
    if (!user) {
      throw new apiError(404, "User not found");
    }
    return res
      .status(200)
      .json(new ApiResponse(201, user, "Profile Picture Updated successfully!"));
  }
  catch (error) {
    console.error("Update profile picture error:", error);
    throw new apiError(500, error.message || "Something went wrong while updating profile picture");
  }
});

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
  const user = await User.findById(req.user?._id)
    .select("-password -refreshToken")
    .populate('sellPosts'); // Use the virtual name
    
  if (!user) { 
    throw new apiError(404, "User not Found !") 
  }
  
  return res.status(200).json(
    new ApiResponse(200, user, "user Found SuccessFully !")
  )
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

// Add this new controller function
const getUserProducts = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user?._id)
      .select("-password -refreshToken")
      .populate({
        path: 'userSellpost',
        select: 'title price description image status createdAt',
        options: { sort: { createdAt: -1 } } // Sort by newest first
      });

    if (!user) {
      throw new apiError(404, "User not found");
    }

    return res.status(200).json(
      new ApiResponse(200, user.userSellpost, "User products fetched successfully")
    );
  } catch (error) {
    throw new apiError(500, error.message || "Failed to fetch user products");
  }
});

export { sendotp, registerUser, complete_profile, loginUser, logoutUser, DeleteUser, GetUserProfile, updateUserProfilePicture, getUserProducts }