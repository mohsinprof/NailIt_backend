const express = require('express');
/* require authroutes */
const authRouter=require('./routes/auth.routes')
const app=express();

app.use(express.json());

/** using all the routes here  */
app.use("/api/auth",authRouter)


module.exports=app;