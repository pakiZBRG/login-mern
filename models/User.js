const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, trim: true, required: true },
    email: { type: String, trim: true, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, default: 'Normal' },
    resetPasswordLink: { data: String, default: "" }
}, {timestamp: true})

module.exports = mongoose.model('User', userSchema);