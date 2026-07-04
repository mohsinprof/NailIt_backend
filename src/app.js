const express = require('express');
const cookiePArser=require('cookie-parser');
/* require authroutes */
const authRouter=require('./routes/auth.routes')
const app=express();

app.use(express.json());
app.use(cookiePArser());

/** using all the routes here  */
app.use("/api/auth", authRouter)



module.exports=app;