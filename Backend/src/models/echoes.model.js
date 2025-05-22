import mongoose from "mongoose";

const threadSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Assuming you have a User model
    required: true,
  },
  content: {
    type: String,
    required: true,
    maxlength: 280, // Limit similar to Twitter
  },
  markedasFlag: { 
    type: Boolean, 
    default:false
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Thread = mongoose.model("Thread", threadSchema); 
export { Thread}