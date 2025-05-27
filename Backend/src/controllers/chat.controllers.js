import { User } from "../models/users.models.js";   
import { Message } from "../models/message.models.js"; 
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js"; 
import {Chat} from "../models/chat.models.js"
import ApiResponse from "../utils/apiResponse.js";
import { onlineusers } from "../utils/socketHandler.js";

const CreatChat = asyncHandler(async (req, res) => {
  const { participant_id1, participant_id2 } = req.body;

  if (!participant_id1 || !participant_id2 || participant_id1 === participant_id2) {
    throw new apiError(404, "Invalid participants: IDs are missing or both are the same.");
    } 
  console.log(participant_id1, participant_id2)
  const p1 = await User.findById(participant_id1);
  const p2 = await User.findById(participant_id2);
  if (!p1 || !p2) {
    throw new apiError(404, "User not found in the Database");
  }

  // Sort participant IDs before querying/creating
  const participantsSorted = [participant_id1, participant_id2].sort();

  // Find chat with sorted participants
  let chat = await Chat.findOne({ participants: participantsSorted });

  if (chat) {
    return res.status(200).json(new ApiResponse(200, chat, "Found existing chat!"));
  }
  else {
    chat = await Chat.create({ participants: participantsSorted });
    if (!chat) {
      throw new apiError(501, "Failed to Create the Chat!");
    }
    return res.status(201).json(new ApiResponse(201, chat, "Successfully Created the Chat"));
  }
});

const GetAllUserChats = asyncHandler(async (req, res) => {  
    const userId = req.user?._id
    if (!userId) {  
        throw new apiError(404, "userId Not Found !") 
    }
    const chats = await Chat.find({ participants: userId }).populate("participants", "fullName program course enrollmentYear ProfilePicture") 
    if (!chats) {  
        throw new apiError(401, "No Chats were Found for the User !") 
    } 
    return res.status(201).json(new ApiResponse(201, chats, "Chats Found SuccesFully")) 
    
})
 
async function handleSendMessage(socket,io,data,callback){
    try {
      const { senderId, recevierId, content ,chatId } = data 
      if (!senderId || !recevierId || !content || !chatId) {  
        return callback({ error: "required Fields are not there !" }) 
      } 
      const message = await Message.create({ 
        chat:chatId, 
        sender:senderId, 
        receiver:recevierId, 
        content:content,
      }) 
      if (!message) return callback({ error: "failed to Save the Message !" }) 
      const receversocketid = onlineusers.get(recevierId) 
      if (receversocketid) {
        io.to(receversocketid).emit('recive-message', message)
      }      
      else {  
        await Notification.create({ 
          type: message, 
          from: senderId, 
          to: recevierId,  
          message: `You received a new message from ${senderId}`, 
          data: message,
        })
      } 
      callback({ success: true, message }); 
    } catch (error) {
      console.log(error) 
      return callback({ error: error }) 
    }
} 

export {CreatChat, GetAllUserChats,handleSendMessage}
