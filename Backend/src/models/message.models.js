import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 
  content: {
    type: String,  
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now  // Timestamp for when the message is sent
  },
  status: {
    type: String,  
    enum: ['delivered', 'seen','pending',"not seen"],
    default: 'delivered' 
  }
});

export const Message = mongoose.model('Message', messageSchema);


