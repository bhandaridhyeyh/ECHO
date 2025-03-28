import { asyncHandler } from "../utils/asyncHandler.js"; 
import  ApiResponse  from "../utils/apiResponse.js"; 
import { apiError } from "../utils/apiError.js"; 
import { Deal } from "../models/deal.models.js"; 
import { Sellpost } from "../models/sellpost.models.js";

const requestDeal = asyncHandler(async (req, res) => {
    const { postId } = req.params  
    const buyer_id = req.user._id 
    const post = await Sellpost.findById(postId); 
    if (!post) {  
        throw new apiError(404, "Post not Found!") 
    } 
    const seller_id = post.seller.toString()
    if (seller_id === buyer_id) {  
        throw new apiError(400, "You can not request on your own post !") 
    } 
    const existingDeal = Deal.findOne({ seller_id, buyer_id }) 
    if (!existingDeal) {  
        throw new apiError(400, "You Have already requested for The Deal") 
    } 
    const deal = Deal.create({ 
        postId: postId, 
        buyerId: buyer_id, 
        sellerId: seller_id, 
        status:"pending"
    }) 
    if (!deal) {  
        throw new apiError(501,"Failed to genrate the Deal request")
    }
    res.status(200) 
        .json(new ApiResponse(201, deal, "the Deal request SuccessFully Genrated")) 
    
})  

const handleDealrequest = asyncHandler(async (req, res) => {  
    const { deal_id } = req.params
    if (!deal_id) { 
        throw new apiError(404,"No Deal was found to be Settled")
    }
    const status = req.body   
    
    if (!status || !["accepted", "rejected"].includes(status)) {  
        throw new apiError(401,"Not Valid Status Provided")
    }
    const deal = await Deal.findByIdAndUpdate(deal_id,{status:status})
    if (!deal) {  
        throw new apiError(501,"Failed to Update the Deal!")
    } 
    if (status === "accepted") {
        const post = await Sellpost.findByIdAndUpdate(deal.postId, { status: "sold" }) 
        if (!post) {  
            throw new apiError(501,"Failed to Update the post status ")
        }
    }  
    res.status(201).json(new ApiResponse(201, deal, `Deal has been ${status}`)) 
    
})
    
export {requestDeal,handleDealrequest}