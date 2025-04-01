import { Router } from "express"; 
import { verifyJWT } from "../middlewares/verifyJwt.js";;
const router = Router() 
router.use(verifyJWT) 
router.route('/create').post(CreateThread)
router.route('/:id').put(UpdateThread).delete(DeleteThread); 
router.route('/all').get(GetallThread) 
