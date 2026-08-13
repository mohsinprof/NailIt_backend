
const userModel = require('../models/user.model');
const tokenBlacklistModel = require('../models/blacklist.model')

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
/**
 *@name registerUserController 
 * @desc Controller for registering a new user
 * @access Public
 */

async function registerUserController(req, res) {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
        return res.status(400).json({ 
            message: 'Please provide username, email, and password' 
        });
    }

    const isUserExist = await userModel.findOne({ 
        $or: [{ email }, { username }] 
    });
    
    if (isUserExist) {
        return res.status(400).json({
             message: 'User already exists' 
        });
    }   

    const hash = await bcrypt.hash(password, 10);
    
    // ✅ FIX: Removed the "new" keyword and added "await"
    const newUser = await userModel.create({
        username,
        email,
        password: hash
    });

    const token = jwt.sign(
        { id: newUser._id, username: newUser.username }, 
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );
    
    res.cookie("token", token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, 
    });

    res.status(201).json({
        message: 'User registered successfully',
        user: {
            id: newUser._id,
            username: newUser.username,
            email: newUser.email
        }
    });
}

/** 
 * @name loginUserController
 * @desc Controller for logging in a user
 * @access Public
*/
async function loginUserController(req,res){
    const { email, password } = req.body;
    // console.log("loginUserController",email,password)
    
     if(!email || !password){
        return res.status(400).json({message:'Please provide email and password'})
     }
    
    const user = await userModel.findOne({ email });
    
   
    if(!user){
        return res.status(404).json({message:'User not found'})
    }
    
        const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
    const token = jwt.sign(
        {id :user._id, username:user.username 
        }, process.env.JWT_SECRET,
        {expiresIn:"1d"}
    )
    res.cookie("token", token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,

    })

    res.status(200).json({
        message: 'User logged in successfully',
        user:{
            id:user._id,
            username:user.username,
            email:user.email
        }})

}

/** 
 * @name logoutUserController
 * @desc Controller for logging out a user
 * @access Public
 */

async function logoutUserController(req, res) { 
    const token = req.cookies.token;
    if (!token) {
        
        return res.status(400).json({ message: 'No token found' });
    }
    if (token) {
        await tokenBlacklistModel.create({ token });
    }
    res.clearCookie("token");
    res.status(200).json({
        message:"User logged out successfully"
    })



}


/**
 * @name getMeController
 * @desc Controller for getting the current logged-in user's details
 * @access Private

 */
async function getMeController(req, res) {
    const user = await userModel.findById(req.user.id)
    res.status(200).json({
        message: 'Current logged-in user details fetched ',
        user: {
            id: user._id,
            username:user.username,
            email: user.email
        }
    })
}

module.exports = {registerUserController, loginUserController,logoutUserController, getMeController}