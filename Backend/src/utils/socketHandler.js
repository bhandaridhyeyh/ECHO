import { handleRequestDeal,handleResponseDeal} from "../controllers/Deal.controllers.js";
import { handleSendMessage,getChatHistory} from "../controllers/chat.controllers.js"; 
import Notification from "../models/notifications.models.js"
const onlineusers = new Map();
const socketHandler = (io) => {
    io.on('connection', (socket) => {
        console.log("user id is :", socket.id) 
        console.log(onlineusers)
        socket.on('register', async (userId) => { 
            onlineusers.set(userId, socket.id)  // mapping userid to socket.id for online user to keep a track of which online user has which id !
            console.log(onlineusers)
            const pendingNotifications = await Notification.find({ to: userId, seen: false })
            if (pendingNotifications.length > 0) {
                io.to(socket.id).emit("pending-notifications", pendingNotifications);
                await Notification.updateMany(
                    { to: userId, seen: false },
                    { $set: { seen: true } });
            }
        })
        socket.on('request-deal', (data, callback) => {
            handleRequestDeal(socket, io, data, callback); // here's where you pass socket and io
        });
        socket.on('response-deal', (data, callback) => {
            handleResponseDeal(socket, io, data, callback);
        }) 
        socket.on('getChatHistory', (data, callback) => {
            getChatHistory(socket, io, data, callback);
        });
        socket.on('sendMessage', (data, callback) => {
            handleSendMessage(socket, io, data, callback);
        }) 
        socket.on("disconnect", () => {
            for (const [userId, socketId] of onlineusers.entries()) {
                if (socketId === socket.id) {
                    onlineusers.delete(userId);
                    break;
                }
            }  
            console.log(onlineusers)
            console.log("disconencted succesfully ")
        })
    })
}
export { socketHandler , onlineusers}
