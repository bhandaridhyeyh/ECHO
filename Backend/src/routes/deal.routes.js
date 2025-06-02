import { Router } from "express"; 
import { verifyJWT } from "../middlewares/verifyJwt.js"; 
import {handleResponseDeal, handleRequestDeal} from "../controllers/Deal.controllers.js";
const router = Router() 
router.route('/request-deal/:postId').post(verifyJWT, handleRequestDeal) 
router.route('/handle-deal/:dealId').post(verifyJWT, handleResponseDeal) 
export default router