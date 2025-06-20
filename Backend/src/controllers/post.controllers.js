import { asyncHandler } from "../utils/asyncHandler.js";
import { Sellpost } from "../models/sellpost.models.js";
import { User } from "../models/users.models.js";
import { UploadOnCloud, DeleteOnCloud } from "../utils/cloudinary.js";
import { apiError } from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";

const CreatePost = asyncHandler(async (req, res) => {
  const { title, description, quantity, price, status, category } = req.body;
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
  if (!price || typeof price !== "string") {
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

const UpdatePost = asyncHandler(async (req, res) => {
  const postId = req.params.id;
  const { title, description, price, quantity, category } = req.body;

  // Find the post
  const post = await Sellpost.findById(postId);
  if (!post) {
    throw new apiError(404, "Post not found!");
  }

  // Update text fields
  if (title) post.title = title;
  if (description) post.description = description;
  if (price) post.price = price;
  if (quantity) post.quantity = quantity;
  if (category) post.category = category;

  // Handle new image upload
  if (req.file) {
    // Upload to Cloudinary
    const cloudUpload = await UploadOnCloud(req.file.path);
    if (!cloudUpload) {
      throw new apiError(500, "Cloudinary image upload failed");
    }

    // Optional: delete old image from Cloudinary if needed
    // if (post.image) await DeleteOnCloud(post.image);

    // Update image URL
    post.image = cloudUpload.secure_url;
  }

  // Save updated post
  await post.save();

  return res
    .status(200)
    .json(new ApiResponse(200, post, "Successfully updated post!"));
});

const DeletePost = asyncHandler(async (req, res) => {
  const postId = req.params.id
  if (!postId) {
    throw new apiError(404, "postId not found!")
  }
  const deletedpost = await Sellpost.findByIdAndDelete(postId)
  if (!deletedpost) {
    throw new apiError(500, "server failed to delete the post!")
  }
  res.status(200).json(new ApiResponse(200, "post Deleted Successfully"))
});

const GetallPost = asyncHandler(async (req, res) => {
  const posts = await Sellpost.find().populate('seller', 'fullName contactNumber course program ProfilePicture');
  res.status(201).json(new ApiResponse(201, posts, "Returned all the posts !"))
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

  const posts = await Sellpost.find(filter).populate('seller', 'fullName contactNumber course program ProfilePicture');

  if (!posts.length) {
    throw new apiError(404, "No matching posts found.");
  }
  res.status(200).json(new ApiResponse(201, posts, "Searched Results"));

});

const GetSpecificPost = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const post = await Sellpost.findById(id).populate('seller', 'fullName contactNumber course program ProfilePicture');

  if (!post) {
    throw new apiError(404, "Post not found");
  }

  res.status(200).json(new ApiResponse(200, post, "Fetched specific post successfully"));
});

export { CreatePost, UpdatePost, DeletePost, GetallPost, SearchedPost, GetSpecificPost };
