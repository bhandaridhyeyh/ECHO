import { asyncHandler } from "../utils/asyncHandler.js"; 
import ApiResponse from "../utils/apiResponse.js"; 
import { apiError } from "../utils/apiError.js"; 
import { Thread } from "../models/thread.model.js";

const CreatThread = asyncHandler(async (req, res) => {  
    const { content, markedAsFlagged } = req.body 
    const user = req.user?.id 
    console.log(content,markedAsFlagged)
    if (!content ) {  
        throw new apiError(404,"Important fields not Found !")
    } 
   
    if (!user) {  
       throw new apiError(404,"user id not found !")
    }
    const thread = Thread.create({ content: content, user: user, markedasFlag: markedAsFlagged }) 
    if (!thread) {  
        throw new apiError(403,"failed to create the Thread post !")
    } 
    return res.status(201) 
    .json(new ApiResponse(201,thread,"successfully created the thread !"))
}) 
const GetallThread = asyncHandler(async (req , res) => { 
    const threads = Thread.find() 
    if (!threads) {  
        throw new apiError(401,"threads not Found !")
    } 
    return res.status(200) 
    .json(new ApiResponse(201,threads,"All threads returned !"))
})   
const UpdateThread = asyncHandler(async (req, res) => { })
const DeleteThread = asyncHandler(async (req, res) => {})
export { CreatThread, GetallThread,UpdateThread,DeleteThread } 
