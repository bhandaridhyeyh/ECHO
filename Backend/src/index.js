import { app, corsOptions } from "./app.js"; 
import { Server } from "socket.io";  
import dbConnection from "./db/dbconnector.js"; 
import { socketHandler } from "./controllers/chat.controllers.js";   
import http from 'http'; 
import 'dotenv/config' 


const server = http.createServer(app) 
const io = new Server(server, { cors: corsOptions });
dbConnection()
    .then(() => {
        server.listen(process.env.PORT, () => {    
        console.log(`server is working at ${process.env.PORT}`)
        }) 
        socketHandler(io);
    })
    .catch((error)=>{ 
    console.log("connection failed !")
})