import { Router } from "express"; 
import { verifyJWT } from "../middlewares/verifyJwt.js";   
import { CreatChat } from "../controllers/chat.controllers.js";

const router = Router() 
router.use(verifyJWT) 
router.route('/create').post(CreatChat)
router.route('/:id').get(GetSpecificChat) 
router.route('/:userId').get(GetAllUserChats)
