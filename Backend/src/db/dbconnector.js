import mongoose from "mongoose";   
const dbConnection = async ()=>{
    try {
            await mongoose.connect("mongodb://localhost:27017/TradeMate", {})
            console.log("Database Connection Established !")
        } catch (error) {
            console.log(error?.message) 
            process.exit(1)
        }
    }
export default dbConnection