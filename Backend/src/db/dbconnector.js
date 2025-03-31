import mongoose from "mongoose";  
import 'dotenv/config'   
const dbConnection = async ()=>{
    try {    
        await mongoose.connect(`${process.env.MONGODB_URL}`, {})
            console.log("Database Connection Established !")
        } catch (error) {
            console.log(error?.message) 
            process.exit(1)
        }
    }
export default dbConnection 
