import { User } from "../models/users.models.js";   
import { Message } from "../models/message.models.js"; 
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js"; 
import {Chat} from "../models/chat.models.js"
import ApiResponse from "../utils/apiResponse.js";

const users = {} 

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
 
const socketHandler = (io) => {
    io.on('connection', (socket) => {
        console.log("user socket id :", socket.id)
        
        // user joins the chat !
        socket.on('join', async (userId) => {
            users[userId] = socket.id
            console.log(`${userId} connected with the ${socket.id}`)
            
            //checking and sending for any msg which to delivere when user comes online 
            const unreadMessages = await Message.find({ receiver: userId, status: "pending" });
            for (const msg of unreadMessages) {
                await Message.findByIdAndUpdate(msg._id, { status: "delivered" });
                io.to(users[userId]).emit("receiveMessage", {
                    _id: msg._id,
                    senderId: msg.sender,
                    message: msg.content,
                    status: "delivered",
                    timestamp: msg.timestamp,
                });
            }
        }) 
        // to retrieve chat history 
        socket.on('getChatHistory', async (userId1, userId2) => {
            try {
                const chatHistory = await Message.find({
                    $or: [
                        { sender: userId1, receiver: userId2 },
                        { sender: userId2, receiver: userId1 },
                    ],
                }).sort({ timestamp: 1 }); // Sort messages by timestamp to show in order
            
                io.to(socket.id).emit('chatHistory', chatHistory);
            }
            catch (error) {  
                console.error('Error fetching chat history:', error);
                throw new Error('Error fetching chat history');
            }  
        }); 
        // to send the msg which creates a msg document or entry in db 
        socket.on("sendMessage", async (sender, receiver, content) => {
            try {
                
                const newMessage = await Message.create({ sender, receiver, content, status: users[receiver] ? "delivered" : "pending" })
                if (!newMessage) {
                    socket.emit("error", {
                        message: "Failed to send message. Please try again.",
                    });
                }

                // when the user is online (its connected to the server and has a socket id ) msg is sent 
                if (users[receiver]) {
                    await Message.findByIdAndUpdate(newMessage._id, { status: "delivered" });

                    io.to(users[receiver]).emit("receiveMessage", {
                        _id: newMessage._id,
                        sender,
                        content,
                        status: "delivered",
                        timestamp: newMessage.timestamp,
                    });
                    // to notify the sender that msg is sent 
                    socket.emit("messageStatusUpdate", {
                        _id: newMessage._id,
                        status: users[receiver] ? "delivered" : "pending"
                        
                    });
                }
            }
            catch (error) {
                console.error("Error sending message:", error.message);
                socket.emit("error", { message: "Failed to send message." });
            }
        })
    })}

export {socketHandler,CreatChat, GetAllUserChats,}
