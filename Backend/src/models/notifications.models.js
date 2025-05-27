import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ["deal-request", "message", "friend-request", "other"], // Add your types here
  },
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  data: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: "Deal",
  },
  seen: {
    type: Boolean,
    default: false,  // Whether the notification has been seen by the user
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
