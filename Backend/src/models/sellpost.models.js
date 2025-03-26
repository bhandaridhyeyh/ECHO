import mongoose from "mongoose"; 
const SellpostSchema = mongoose.Schema({

    title: { type: String, required: true }, 
    description: { type: String, required: true }, 
    category: { type: String, required: true }, 
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to User model
    price: { type: Number, required: true }, 
    quantity: { 
        type: Number, 
        required: true, 
        min: [1, "Quantity must be at least 1"]
    }, 
    image: { type: String ,required:true,},
    Status: {
        type: String,
        enum: ['available', 'sold'],
        default: 'available'
    }
},   
    { timestamps: true })  

export const Sellpost = mongoose.model('Sellpost',SellpostSchema)