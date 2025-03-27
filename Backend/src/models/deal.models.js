import mongoose from "mongoose";
const dealRequestSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: "SellPost", required: true },
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" }
}, { timestamps: true }); 

export const Deal = mongoose.model('Deal', dealRequestSchema); 
