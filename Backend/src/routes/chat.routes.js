import { Router } from "express";
import { verifyJWT } from "../middlewares/verifyJwt.js";
import {
  CreatChat,
  GetAllUserChats,
  GetChatHistory
} from "../controllers/chat.controllers.js";

const router = Router();
router.use(verifyJWT);

router.route('/create').post(CreatChat);
router.route('/all').get(GetAllUserChats);
router.route('/history/:chatId').get(GetChatHistory);

export default router;