import mongoose from "mongoose";
const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,  // References to User collection for participants
    ref: 'User',
    required: true
  }],
  messages: [{
    type: mongoose.Schema.Types.ObjectId,  // Reference to the Message collection
    ref: 'Message'
  }],
  deal: {
    type: mongoose.Schema.Types.ObjectId,  
    ref: 'Deal'
  }
}, {
  timestamps: true  
}); 

export const Chat = mongoose.model('Chat', chatSchema);
