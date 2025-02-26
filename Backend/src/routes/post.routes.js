import { Router } from "express";
import { CreatePost, DeletePost, GetallPost, SearchedPost, UpdatePost } from "../controllers/post.controllers.js";

const router = Router() 
router.route('/create-sell-post').post(CreatePost) 
router.route('/update-sell-post').put(UpdatePost)
router.route('/delete-sell-post').delete(DeletePost)
router.route('/getall-sell-post').get(GetallPost)
router.route('/search-sell-post').get(SearchedPost) 
