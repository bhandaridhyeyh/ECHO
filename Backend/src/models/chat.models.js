// models/Chat.js
import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

chatSchema.pre('save', function(next) {
  if (this.participants.length !== 2) {
    return next(new Error('Participants array must have exactly 2 user IDs'));
  }
  this.participants.sort();
  next();
}); 

chatSchema.index({participants:1 }, { unique: true });
const Chat = mongoose.model('Chat', chatSchema);
export { Chat };
