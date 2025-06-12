import { asyncHandler } from "../utils/asyncHandler.js"; 
import ApiResponse from "../utils/apiResponse.js"; 
import { apiError } from "../utils/apiError.js"; 
import { Thread } from "../models/echoes.model.js";

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
    const threads = await Thread.find().populate('user', 'fullName ProfilePicture course program').sort({ createdAt: -1 });
    if (!threads) {  
        throw new apiError(401,"threads not Found !")
    }  
    return res.status(200) 
    .json(new ApiResponse(200,threads,"All Echoes returned !"))
})    

const UpdateThread = asyncHandler(async (req, res) => {
  const { threadId } = req.params;
  const { content, markedasFlag } = req.body;
  const userId = req.user?.id;

  if (!threadId || !userId) {
    throw new apiError(400, "Thread ID or User ID missing!");
  }

  const thread = await Thread.findById(threadId);

  if (!thread) {
    throw new apiError(404, "Thread not found!");
  }

  // Only the thread creator can update it
  if (thread.user.toString() !== userId.toString()) {
    throw new apiError(403, "You are not authorized to update this thread!");
  }

  // Validate content if present
  if (content && content.length > 280) {
    throw new apiError(400, "Content exceeds 280 characters limit!");
  }

  // Update only if fields are provided
  if (typeof content === "string") thread.content = content;
  if (typeof markedasFlag === "boolean") thread.markedasFlag = markedasFlag;

  await thread.save();

  return res
    .status(200)
    .json(new ApiResponse(200, thread, "Thread updated successfully!"));
});

const DeleteThread = asyncHandler(async (req, res) => {
    const { threadId } = req.params;
    const userId = req.user?.id;

    if (!threadId || !userId) {
        throw new apiError(400, "Thread ID or User ID missing!");
    }

    const thread = await Thread.findById(threadId);

    if (!thread) {
        throw new apiError(404, "Thread not found!");
    }

    // Ensure only the owner can delete
    if (thread.user.toString() !== userId.toString()) {
        throw new apiError(403, "You are not authorized to delete this thread!");
    }

    await thread.deleteOne();

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Thread deleted successfully!"));
});
export { CreatThread, GetallThread,UpdateThread,DeleteThread } 
