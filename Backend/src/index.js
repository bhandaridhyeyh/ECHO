import {app} from "./app.js";  
import dbConnection from "./db/dbconnector.js";  
import 'dotenv/config'
dbConnection()
    .then(() => { app.listen(process.env.PORT, () => {   
        console.log(`server is working at ${process.env.PORT}`)
    })})
    .catch((error)=>{ 
    console.log("connection failed !")
})