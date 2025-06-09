import mongoose from "mongoose";
const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  imageUrls: {
    type: [String],  // Array of strings for multiple image URLs
    required: true
  },
  category: {
    type: String,
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  Quantity: {
    type: Number,
    required: true,
    default: 1,
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
},
  {
    timestamps: true
  });

export const Product = mongoose.model('Product', productSchema);
