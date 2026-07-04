const express = require('express');
const authController = require('../contoller/auth.controller');
const authMiddleware = require('../middleware/auth.middleware')

const authrouter = express.Router();
/** @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */

authrouter.post('/register', authController.registerUserController);

/** @route POST /api/auth/login
 * @desc Login a user with email and password
 * @access Public
 */
authrouter.post('/login', authController.loginUserController);

/** 
 * @route GET /api/auth/logout
 * @desc Logout a user by blacklisting the token
 * @access Public
 */
authrouter.get('/logout', authController.logoutUserController);

/**
 * @route GET /api/auth/get-me
 * @description get the crruent looginf details of the user
 * @access Private
 * 
 */
authrouter.get('/get-me', authMiddleware.authuser,authController.getMeController);

module.exports = authrouter;