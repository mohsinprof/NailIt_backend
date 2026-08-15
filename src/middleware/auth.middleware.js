const jwt = require('jsonwebtoken');
const tokenBlacklistModel = require('../models/blacklist.model')



async function authuser(req, res, next) {
    const token = req.cookies.token;
    if(!token){
        return res.status(401).json({message:"Unauthorized access or token is empty"})
    }
    const isTokenBlacklisted = await tokenBlacklistModel.findOne({ token });
    if (isTokenBlacklisted) { 
        return res.status(401).json({ message: 'token is invalid and blacklisted  '}); 
    }


    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();

    } catch (err) {
        console.log(token)
        return res.status(401).json({message:"Unauthorized access or session expired"})
    } 
    
   
} 
module.exports = {authuser};