import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({ 
  chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
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
    enum: ['sent','delivered','read'],
    default: 'sent' 
  }
});

export const Message = mongoose.model('Message', messageSchema);


