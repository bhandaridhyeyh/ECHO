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
    type: int, 
    required: true, 
    default: 1, 
  } 
},
{
  timestamps: true  
});

export const Product = mongoose.model('Product', productSchema);
