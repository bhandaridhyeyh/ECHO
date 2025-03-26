import express from 'express'; 
import cors from 'cors'; 
import cookieParser from 'cookie-parser'; 
import 'dotenv/config'  
import http from 'http'
const app = express()  
const corsOptions= { 
    origin: process.env.CORS_ORIGIN,
    Credential : true
}
app.use(cors(corsOptions))
app.use(express.urlencoded({ extended: true })) // // express.urlencoded is used to allow and make it ready to accept data from urls by parsing it into json objects
app.use(cookieParser()) 
app.use(express.static('public')) // to configure public assest and store them
app.use(express.json())
  
import userRoutes from './routes/user.routes.js' 
import PostRoutes from './routes/post.routes.js' 
import { verifyJWT } from './middlewares/verifyJwt.js';

app.use('/user', userRoutes) 
app.use('/post',PostRoutes)
app.get("/",(req,res) => { 
    return res.sendFile("/public/temp/index.html")
})
export { app , corsOptions }