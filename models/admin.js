const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const adminData = new Schema({
    email: {
        type: String,
        unique: true,
        require: true
    },
    pass: {
        type: String,
        require: true
    },
    confirmpass: String,
    AdsStatus:
    {
        type: Boolean,
        enum: ['true', 'false'],
        default: 'false',
        required: true
    }
});


module.exports = mongoose.model('admin', adminData)