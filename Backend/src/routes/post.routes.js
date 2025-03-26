import { Router } from "express";
import { verifyJWT } from "../middlewares/verifyJwt.js";
import { CreatePost, DeletePost, GetallPost, SearchedPost, UpdatePost, GetSpecificPost } from "../controllers/post.controllers.js"; 
import { upload } from "../middlewares/multer.middlewares.js";

const router = Router() 
router.route('/sell-posts').post(verifyJWT,upload.single('Productpicture'),CreatePost).get(GetallPost); 
router.route('/sell-post/:id').put(UpdatePost).delete(DeletePost).get(GetSpecificPost);
router.route('/sell-posts/search').get(SearchedPost);
export default router 