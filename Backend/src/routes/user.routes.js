import { Router } from "express"; 
import { upload } from "../middlewares/multer.middlewares.js"; 
import { complete_profile, DeleteUser, GetUserProfile, loginUser, logoutUser, registerUser, sendotp, updateUserProfilePicture, getUserProducts } from "../controllers/user.controllers.js";
import { verifyJWT } from "../middlewares/verifyJwt.js";
const router = Router() 
router.route('/register').post(registerUser) 
router.route('/sendotp').post(sendotp)
router.route('/complete-profile').put(verifyJWT, upload.single('ProfilePicture'), complete_profile) 
router.route('/login').post(loginUser) 
router.route('/logout').post(verifyJWT, logoutUser)  
router.route('/profile').get(verifyJWT, GetUserProfile)  
router.route('/update-profile-picture').put(verifyJWT, upload.single('ProfilePicture'),updateUserProfilePicture)
router.route('/update-user').put(verifyJWT) 
router.route('/delete-user').delete(verifyJWT,DeleteUser)
router.route('/user-products').get(verifyJWT, getUserProducts);
export default router