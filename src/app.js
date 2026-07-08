const express = require('express');
const cookiePArser=require('cookie-parser');
/* require authroutes */
const authRouter = require('./routes/auth.routes')
const cors = require('cors')





const app=express();

app.use(express.json());
app.use(cookiePArser());
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}))

/** using all the routes here  */
app.use("/api/auth", authRouter)



module.exports=app;