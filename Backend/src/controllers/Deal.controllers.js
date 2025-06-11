import { apiError } from "../utils/apiError.js"; 
import { Deal } from "../models/deal.models.js"; 
import { Sellpost } from "../models/sellpost.models.js";
import { onlineusers } from "../utils/socketHandler.js";
import Notification from "../models/notifications.models.js";

async function handleRequestDeal(socket, io, data, callback = () => {}) {  
    try {
        const { sellerId, buyerId, postId } = data 
        const post = await Sellpost.findById(postId); 
        if (!post) return callback({ error: "Post not Found!" }) 
        if (sellerId === buyerId) return callback({ error: "seller and buyer are same !" }) 
        const existingDeal = await Deal.findOne({ sellerId, buyerId, postId }) 
        if (existingDeal) return callback({ error: "Deal already Exists! " }) 
        const deal = await Deal.create({ 
        postId: postId, 
        buyerId: buyerId, 
        sellerId: sellerId, 
        status:"pending"
        }) 
        if (!deal) return callback({ error: "Deal failed to created server error !" }) 
        const populatedDeal = await Deal.findById(deal._id).populate({
            path: "buyerId",
            select: "fullName" // Only fetch fullName field
        }); 
        if (!populatedDeal) return callback({ error: "Deal failed to created server error !" })
        const receversocketid = onlineusers.get(sellerId) 
        if (receversocketid) {  
            io.to(receversocketid).emit("deal-request", populatedDeal);

        } 
        else { 
            const notification = await Notification.create({ 
            type: 'deal-request', 
            from: buyerId, 
            to: sellerId, 
            message: `You have a new deal request from user ${buyerId}`,
            data:populatedDeal
        }) 
        if (!notification) {  
            throw new apiError(501,"Failed to genrate the Deal request !")
        }
        } 
        return callback({ success: true, deal }); // goes back to the one who triggered it !!
    }
    catch (error) {
    console.error("Error in handleRequestDeal:", error);
    if (typeof callback === "function") {
        callback({ error: "Internal server error" });
    }
    }
}   
    
async function handleResponseDeal(socket, io, data, callback = () => {}) {
    try {
        const { dealId, status } = data;  
        if (!dealId) return callback({ error: "No Deal was found to be settled" });
        if (!status || !["accepted", "rejected"].includes(status)) {
            return callback({ error: "Invalid status provided" });
        }
        const deal = await Deal.findByIdAndUpdate(dealId, { status }, { new: true });
        if (!deal) return callback({ error: "Failed to update the deal" }); 
        const buyerSocketId = onlineusers.get(deal.buyerId.toString());  
        if (buyerSocketId) {
            io.to(buyerSocketId).emit("deal-response", deal); 
        }
        else {
            await Notification.create({
                type: "deal-response",
                from: deal.sellerId,
                to: deal.buyerId,
                message: `Your deal request has been ${status} by the seller.`,
                data: deal,
            });
        }
        if (status === "accepted") {
            const post = await Sellpost.findByIdAndUpdate(deal.postId, { Status: "sold" }, { new: true });
            if (!post) return callback({ error: "Failed to update the post status" });
        }
        return callback({ success: true, deal });
    }
    catch (error) {  
    console.error("Error in handleResponseDeal:", error);
    if (typeof callback === "function") {
        callback({ error: "Internal server error" });
    }
    }
}
export {handleRequestDeal, handleResponseDeal}