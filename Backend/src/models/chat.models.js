import mongoose from "mongoose";
const chatSchema = new mongoose.Schema({
  type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], 
}, { timestamps: true }); 

chatSchema.index({ participants: 1, participants: -1 }, { unique: true})
const Chat = mongoose.model('Chat', chatSchema);
export {Chat}
