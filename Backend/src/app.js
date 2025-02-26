import express from 'express'; 
import cors from 'cors'; 
import cookieParser from 'cookie-parser';
import 'dotenv/config'
const app = express()  
app.use(cors({ 
    origin: process.env.CORS_ORIGIN,
    Credential : true
}))
app.use(express.urlencoded({ extended: true })) // // express.urlencoded is used to allow and make it ready to accept data from urls by parsing it into json objects  
app.use(cookieParser()) 
app.use(express.static('public')) // to configure public assest and store them
app.use(express.json())

import userRoutes from './routes/user.routes.js' 
import PostRoutes from './routes/post.routes.js' 
import { verifyJWT } from './middlewares/verifyJwt.js';

app.use('/user', userRoutes) 
app.use('/post',verifyJWT,PostRoutes)

export { app }