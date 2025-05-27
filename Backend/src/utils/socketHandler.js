import { handleDealrequest } from "../controllers/Deal.controllers";
const onlineusers = new Map();
const socketHandler = (io) => {  
    io.on('connection', (socket) => {  
        console.log("user id is :", socket.id) 
        
        socket.on('register', async (userId) => {  
            onlineusers.set(userId,socket.id) // mapping userid to socket.id for online user to keep a track of which online user has which id !
            const pendingNotifications = await Notification.find({ to: userId, seen: false }) 
            if (pendingNotifications.length > 0) {  
                io.to(socket.id).emit("pending-notifications", unreadNotifications); 
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
        socket.on('disconnect', () => {  
            console.log("user disconnected is :",socket.id)
        })
    
    })
} 
export { socketHandler , onlineusers}