import mongoose from "mongoose"; 
import bcrypt from "bcrypt"; 
import jwt from "jsonwebtoken";  
import 'dotenv/config'
const userSchema = new mongoose.Schema({  
    fullName:{
    type: String, 
    default:'Anonymous', 
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
        enum: ['male', 'female', 'others'],  // Only allows these values
        default: null 
      }, 
    ProfilePicture: { 
        type: String,  
      default: null
  },
    
    University: { 
      type: String,  
      trim: true ,
      default: null
  }, 
    
    course: { 
        type: String, 
      trim: true ,
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
  }
},
{ timestamps: true }) 

userSchema.pre('save', async function (next) { 
    if (!this.isModified('password')) { 
        return next();
    } 
    this.password = await bcrypt.hash(this.password,8)
})  

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
}; 

// method to genrate access token 

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
  // method to genrate referesh token 
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

userSchema.virtual('userSellpost', { 
  ref: "Sellpost", 
  localField: '_id', 
  foreignField:'Seller'
})

export const User = mongoose.model("User", userSchema) 
