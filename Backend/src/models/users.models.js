import mongoose from "mongoose"; 
import bcrypt from "bcrypt"; 
import jwt from "jsonwebtoken";  
import 'dotenv/config'

const userSchema = new mongoose.Schema({  
    fullName: {
        type: String, 
        default: 'Anonymous', 
    }, 
    email: {
        type: String, 
        unique: true, 
        required: true, 
        trim: true,
    }, 
    password: {
        type: String, 
        required: true,
    }, 
    enrollmentId: {
        type: String,  
        default: "00000000", 
    },
    enrollmentYear: { 
        type: String, 
        default: null 
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'others', null],
        default: null 
    }, 
    ProfilePicture: { 
        type: String,  
        default: null
    },
    University: { 
        type: String,  
        trim: true,
        default: null
    }, 
    course: { 
        type: String, 
        trim: true,
        default: null
    }, 
    program: { 
        type: String, 
        trim: true, 
        default: null
    }, 
    contactNumber: {      
        type: String,
        trim: true,
        default: null
    },
    refreshToken: {
        type: String, 
    },
    is_online: { 
        type: Boolean, 
        default: false 
    },
    last_ping: { 
        type: Date, 
        default: Date.now 
    },
    // Explicitly define userSellpost as an array of references
    userSellpost: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sellpost'
    }]
}, { 
    timestamps: true,
    toJSON: { virtuals: true }, // Ensure virtuals are included when converting to JSON
    toObject: { virtuals: true } // Ensure virtuals are included when converting to plain objects
}) 

// Password hashing middleware
userSchema.pre('save', async function (next) { 
    if (!this.isModified('password')) { 
        return next();
    } 
    this.password = await bcrypt.hash(this.password, 8);
    next();
});  

// Password verification method
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
}; 

// Access token generation
userSchema.methods.genrateAccessTokens = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
}; 

// Refresh token generation
userSchema.methods.genrateRefreshTokens = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    );
};  

// Virtual for sell posts (alternative approach)
userSchema.virtual('sellPosts', {
    ref: 'Sellpost',
    localField: '_id',
    foreignField: 'seller',
    justOne: false
});

export const User = mongoose.model("User", userSchema);