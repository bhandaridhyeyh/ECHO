import { User } from "../models/users.models.js";
import { Message } from "../models/message.models.js";
import { Chat } from "../models/chat.models.js";
import Notification from "../models/notifications.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import { onlineusers } from "../utils/socketHandler.js";

const CreatChat = asyncHandler(async (req, res) => {
  const { participant_id1, participant_id2 } = req.body;

  if (!participant_id1 || !participant_id2 || participant_id1 === participant_id2) {
    throw new apiError(400, "Invalid participant IDs.");
  }

  const [p1, p2] = await Promise.all([
    User.findById(participant_id1),
    User.findById(participant_id2)
  ]);
  if (!p1 || !p2) throw new apiError(404, "User(s) not found.");

  const participantsSorted = [participant_id1, participant_id2].sort();
  let chat = await Chat.findOne({ participants: participantsSorted });

  if (chat) {
    return res.status(200).json(new ApiResponse(200, chat, "Existing chat found."));
  }

  chat = await Chat.create({ participants: participantsSorted });
  return res.status(201).json(new ApiResponse(201, chat, "Chat created successfully."));
});

const GetAllUserChats = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) throw new apiError(400, "Invalid user ID.");

  const chats = await Chat.find({ participants: userId })
    .populate("participants", "fullName program course enrollmentYear ProfilePicture");

  return res.status(200).json(new ApiResponse(200, chats, "Chats fetched."));
});

const GetChatHistory = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  if (!chatId) throw new apiError(400, "Chat ID is required.");

  const messages = await Message.find({ chat: chatId })
    .populate("sender", "fullName ProfilePicture")
    .populate("receiver", "fullName ProfilePicture")
    .sort({ createdAt: 1 });

  return res.status(200).json(new ApiResponse(200, messages, "Chat history fetched."));
});

const handleSendMessage = async (socket, io, data, callback) => {
  try {
    const { senderId, receiverId, content, chatId } = data;

    if (!senderId || !receiverId || !content || !chatId) {
      return callback({ error: "Missing required fields." });
    }

    const message = await Message.create({
      chat: chatId,
      sender: senderId,
      receiver: receiverId,
      content
    });

    if (!message) return callback({ error: "Failed to save message." });

    const receiverSocketId = onlineusers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receive-message", message);
    } else {
      await Notification.create({
        type: "chat",
        from: senderId,
        to: receiverId,
        message: `New message from ${senderId}`,
        data: message
      });
    }

    callback({ success: true, message });
  } catch (error) {
    console.error(error);
    callback({ error: "Server error while sending message." });
  }
};

export {
  CreatChat,
  GetAllUserChats,
  GetChatHistory,
  handleSendMessage
};