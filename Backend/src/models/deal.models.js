import mongoose from "mongoose";
const dealSchema = new mongoose.Schema({
    buyer: {
      type: mongoose.Schema.Types.ObjectId,  // Reference to the User collection for the buyer
      ref: 'User',
      required: true
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,  // Reference to the User collection for the seller
      ref: 'User',
      required: true
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,  // Reference to the Product collection
      ref: 'Product',
      required: true
    },
    dealStatus: {
      type: Boolean,  // True for completed, false for not completed
      default: false  
    }
  }, {
    timestamps: true  
}); 

export const Deal = mongoose.model('Deal', dealSchema); 
