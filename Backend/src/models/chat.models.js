import mongoose from "mongoose";
const channelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ["public", "private", "dm"], required: true },
});
export const Channel = mongoose.model("Channel", channelSchema);

const messageSchema = new mongoose.Schema({
  from_user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  channel_id: { type: mongoose.Schema.Types.ObjectId, ref: "Channel", required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});
export const Message = mongoose.model("Message", messageSchema);

const userChannelSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  channel_id: { type: mongoose.Schema.Types.ObjectId, ref: "Channel", required: true },
  client_offset: { type: Number, default: 0 }, // Used for read tracking
});

export const UserChannel = mongoose.model("UserChannel", userChannelSchema); 
