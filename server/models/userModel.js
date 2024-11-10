const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    verified: {
        type: Boolean,
    },
    role: {
        type: String,
        default: "user",
    },
    password: {
        type: String,
        required: true,
    },
    mobileNumber: {
        type: String,
        trim: true,
        match: [/^\d{10}$/, 'Please enter a valid 10-digit mobile number'] 
    },
    avatar: {
        type: String, 
        default: ''  
    },  
    uuid: {
        type: String,
        unique: true,
    },
    timestamp: { 
        type: Date, 
        default: Date.now 
    }
})

const User = mongoose.model('User', userSchema)
module.exports = User