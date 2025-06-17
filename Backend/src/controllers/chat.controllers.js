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
  console.log("foundone",chat)
  if (chat) {
    return res.status(200).json(new ApiResponse(200, chat, "Existing chat found."));
  }

  chat = await Chat.create({ participants: participantsSorted });
  console.log("created one",chat)
  return res.status(201).json(new ApiResponse(201, chat, "Chat created successfully."));
});

const GetAllUserChats = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) throw new apiError(400, "Invalid user ID.");

  const chats = await Chat.find({ participants: userId })
    .populate("participants", "fullName program course enrollmentYear ProfilePicture contactNumber");
  return res.status(200).json(new ApiResponse(200, chats, "Chats fetched."));
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
      console.log("message sent !")
    } else {
      await Notification.create({
        type: "message",
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

const getChatHistory = async (socket, io, data, callback) => {
  try {
    const { userId, receiverId } = data;
    if (!userId || !receiverId) {
      return callback({ error: "Missing userId or receiverId." });
    }
    // Sort participants array for consistent querying
    const participantsSorted = [userId, receiverId].sort();
    const chat = await Chat.findOne({ participants: participantsSorted }); 
    if (!chat) {
      return callback({ success: true, messages: [] }); // No chat yet, empty history
    }
    
    const messages = await Message.find({ chat: chat._id })
      .populate('sender', 'fullName ProfilePicture contactNumber')
      .populate('receiver', 'fullName ProfilePicture contactNumber')
      .sort({ createdAt: 1 });
    if (!messages) {  
      callback({error:"failed to fetch the messages"})
    }
    callback({ success: true, messages });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    callback({ error: "Server error while fetching chat history." });
  }
};

export {
  CreatChat,
  GetAllUserChats,
  handleSendMessage,
  getChatHistory
};