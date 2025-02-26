const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,  
    ref: 'User',
    required: true
  },
  chat: {
    type: mongoose.Schema.Types.ObjectId,  
    ref: 'Chat',
    required: true
  },
  message: {
    type: mongoose.Schema.Types.ObjectId,  
    ref: 'Message',
    required: true
  },
  isRead: {
    type: Boolean,  // Notification read status
    default: false  // Default is unread
  },
  timestamp: {
    type: Date,
    default: Date.now  // Timestamp when the notification was created
  }
}, {
  timestamps: true  
});

export const Notification = mongoose.model('Notification', notificationSchema);

