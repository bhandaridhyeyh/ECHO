import { asyncHandler } from "../utils/asyncHandler.js";
import { Sellpost } from "../models/sellpost.models.js";
import { User } from "../models/users.models.js";
import { UploadOnCloud } from "../utils/cloudinary.js";
import { apiError } from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";

const CreatePost = asyncHandler(async (req, res) => {
  const { title, description, quantity, price, status, category} = req.body;
  const seller_id = req.user?._id.toString();  
  console.log(seller_id)
   
  // Validate required fields
  if (!title || typeof title !== "string" || title.trim().length < 3) {
    throw new apiError(400, "The title must be at least 3 characters long.");
  }
  if (!description || typeof description !== "string") {
    throw new apiError(
      400,
      "The description must be at least 10 characters long."
    );
  }
  if (!price || typeof price !== "string" ) {
    throw new apiError(400, "The price must be a positive number.");
  }
  if (!quantity || typeof quantity !== "string") {
    throw new apiError(400, "The Quantity must be a positive number.");
  }
  if (!category || typeof category !== "string" || category.trim().length < 3) {
    return res
      .status(400)
      .json({ message: "Category is required and must be a valid string." });
  }
  if (!seller_id || typeof seller_id !== "string") {
    throw new apiError(400, "The seller ID is required.");
  }

  const allowedStatuses = ["available", "sold"];
  if (status && !allowedStatuses.includes(status)) {
    throw new apiError(400, "Invalid status. Allowed values: available, sold.");
    } 
    
    let Productpicturelocalpath
    if (req.file) {
        Productpicturelocalpath = req.file.path;
    }
    console.log(Productpicturelocalpath) 
    
    if (!Productpicturelocalpath) {
      throw new apiError(400, "Productpicture is required !");
    } 

  const Productpicture = await UploadOnCloud(Productpicturelocalpath);
  
    if (!Productpicture) {
      throw new apiError(500, "Failed to upload Productpicture on cloud");
    } 
    const Post = await Sellpost.create({
        title: title,
        description: description,
        price: price,
        quantity: quantity,
        category: category,
        image: Productpicture.secure_url, 
        status: status || "available",
        seller: seller_id, 
      });
    if (!Post) {  
        throw new apiError(500, "Failed to create a Sell Post !"); 
    } 
    return res.status(201)
        .json(new ApiResponse(201, Post, "Succesfull Sell Post Creation !")); 
});  

const UpdatePost = asyncHandler(async (req, res) => {});
const DeletePost = asyncHandler(async (req, res) => {

});
const GetallPost = asyncHandler(async (req, res) => { 
  const posts = await Sellpost.find(); 
  res.status(201) 
  .json(new ApiResponse(201,posts,"Returned all the posts !"))
});

const SearchedPost = asyncHandler(async (req, res) => {
  
const { title, category, minPrice, maxPrice } = req.query;

let filter = {};

if (title) {
  filter.title = { $regex: title, $options: "i" }; // Case-insensitive search
}
if (category) {
  filter.category = category;
}
if (minPrice || maxPrice) {
  filter.price = {};
  if (minPrice) filter.price.$gte = parseInt(minPrice); // Price >= minPrice $gte = greater than or equal to 
  if (maxPrice) filter.price.$lte = parseInt(maxPrice); // Price <= maxPrice $lte = less than or equal to  
}


const posts = await Sellpost.find(filter);

if (!posts.length) {
  throw new apiError(404, "No matching posts found.");
}

  res.status(200).json(new ApiResponse(201, posts, "Searched Results"));

}); 

const GetSpecificPost = asyncHandler(async (req, res) => { });

export { CreatePost, UpdatePost, DeletePost, GetallPost, SearchedPost, GetSpecificPost };
