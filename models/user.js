const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    pw: {
        type: String,
        required: true
    },
    tray: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Food'
    }]
});

const User = mongoose.model('User', userSchema);

module.exports = User