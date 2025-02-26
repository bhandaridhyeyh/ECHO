import { Router } from "express"; 
import { upload } from "../middlewares/multer.middlewares.js"; 
import { complete_profile, DeleteUser, GetUserProfile, loginUser, logoutUser, registerUser } from "../controllers/user.controllers.js";
import { verifyJWT } from "../middlewares/verifyJwt.js";
const router = Router() 
router.route('/register').post(registerUser)
router.route('/complete-profile').put(verifyJWT, upload.single('ProfilePicture'), complete_profile) 
router.route('/login').post(loginUser) 
router.route('/logout').post(verifyJWT, logoutUser)  
router.route('/userprofile').get(verifyJWT,GetUserProfile) 
router.route('/update-user').put(verifyJWT) 
router.route('/delete-user').delete(verifyJWT,DeleteUser)
export default router 
