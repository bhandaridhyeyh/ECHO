import { apiError } from "../utils/apiError.js"; 
import { Deal } from "../models/deal.models.js"; 
import { Sellpost } from "../models/sellpost.models.js";
import { onlineusers } from "../utils/socketHandler.js";


async function handleRequestDeal(socket, io, data, callback) {  
    try {
        const { sellerId, buyerId, postId } = data 
        const post = await Sellpost.findbyId(postId); 
        if (!post) return callback({ error: "Post not Found!" }) 
        if (sellerId === buyerId) return callback({ error: "seller and buyer are same !" }) 
        const existingDeal = Deal.findOne({ sellerId, buyerId, postId }) 
        if (existingDeal) return callback({ error: "Deal already Exists! " }) 
        const deal = Deal.create({ 
        postId: postId, 
        buyerId: buyerId, 
        sellerId: sellerId, 
        status:"pending"
        }) 
        if (!deal) return callback({ error: "Deal failed to created server error !" }) 
        const receversocketid = onlineusers.get(sellerId) 
        if (receversocketid) {  
            io.to(receversocketid).emit("deal-request", deal); // goes to the target user !!
        } 
        else { 
            const notification = Notification.create({ 
            type: 'deal-request', 
            from: buyerId, 
            to: sellerId, 
            message: `You have a new deal request from user ${buyerId}`,
            data:deal
        }) 
        if (!notification) {  
            throw new apiError(501,"Failed to genrate the Deal request !")
        }
        } 
        callback({ success: true, deal }); // goes back to the one who triggered it !!
    }
    catch (error) {
        callback({error:"internal error"})
    }
}   
    
async function handleResponseDeal(socket, io, data, callback) {
    try {
        const { dealId, status } = data;

        if (!dealId) return callback({ error: "No Deal was found to be settled" });

        if (!status || !["accepted", "rejected"].includes(status)) {
            return callback({ error: "Invalid status provided" });
        }
    
        const deal = await Deal.findByIdAndUpdate(dealId, { status }, { new: true });
        if (!deal) return callback({ error: "Failed to update the deal" });
        const buyerSocketId = onlineusers.get(deal?.buyerId);
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
            const post = await Sellpost.findByIdAndUpdate(deal.postId, { status: "sold" }, { new: true });
            if (!post) return callback({ error: "Failed to update the post status" });
        }
        callback({ success: true, deal });
    }
    catch (error) {
        console.error(err);
        callback({ error: "Internal Server Error" });
    }
}
export {handleRequestDeal,handleResponseDeal}