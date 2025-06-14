import { Router } from "express"; 
import { verifyJWT } from "../middlewares/verifyJwt.js"; 
import { CreatThread, GetallThread,DeleteThread,UpdateThread, GetUserThreads } from "../controllers/echoes.controllers.js";
const router = Router() 
router.use(verifyJWT)
router.route('/creat').post(CreatThread)
router.route('/:id').put(UpdateThread).delete(DeleteThread); 
router.route('/all').get(GetallThread) 
router.route('/user/:userId').get(GetUserThreads)
export default router