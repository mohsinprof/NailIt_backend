const mongoose = require("mongoose")
const blacklistTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: [true, "Token is required to be blacklisted"],
    }
},{
    timestamps: true

}) 
blacklistTokenSchema.index({createdAt:1}, {expireAfterSeconds: 96400})

const tokenBlacklistModel = mongoose.model("blacklistToken", blacklistTokenSchema)


module.exports = tokenBlacklistModel