const mongoose = require("mongoose")
const blacklistTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: [true, "Token is required to be blacklisted"],
    }
},{
    timestamps: true

}) 

const tokenBlacklistModel = mongoose.model("blacklistToken", blacklistTokenSchema)


module.exports = tokenBlacklistModel