import mongoose from "mongoose"; 
const SellpostSchema = mongoose.Schema({
    Seller: { 
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true 
    },
    Product: { 
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true 
    },
    Price: { 
        type: int, 
        required: true,
        min:0,
    },
    Status: {
        type: String,
        enum: ['available', 'sold'],
        default: 'available'
    }
    
}, { timestamps: true })  

export const Sellpost = mongoose.model('Sellpost',SellpostSchema)