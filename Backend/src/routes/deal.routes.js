import { Router } from "express"; 
import { verifyJWT } from "../middlewares/verifyJwt.js"; 
import {requestDeal,handleDealrequest} from "../controllers/Deal.controllers.js";
const router = Router() 
router.route('/request-deal/:postId').post(verifyJWT,requestDeal) 
router.route('/handle-deal/:dealId').post(verifyJWT, handleDealrequest) 
export default router

