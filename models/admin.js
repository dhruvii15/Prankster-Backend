const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const adminData = new Schema({
    email: {
        type: String
    },
    pass: {
        type: String
    },
    confirmpass: String,
    AdsStatus:
    {
        type: Boolean,
        enum: ['true', 'false']
    },
    Link: String,
    CoverImage: String,
    File: String,
    Type: String,
    Name: String,
    ShareURL: String,
    ItemId: Number,
});


module.exports = mongoose.model('admin', adminData)