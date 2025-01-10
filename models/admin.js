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
    CoverSafe:
    {
        type: Boolean,
        enum: ['true', 'false']
    },
    AudioSafe:
    {
        type: Boolean,
        enum: ['true', 'false']
    },
    VideoSafe:
    {
        type: Boolean,
        enum: ['true', 'false']
    },
    ImageSafe:
    {
        type: Boolean,
        enum: ['true', 'false']
    },
    Link: String,
    CoverImage: String,
    File: String,
    Image: String,
    Type: String,
    Name: String,
    ShareURL: String,
    ItemId: Number,
});


module.exports = mongoose.model('admin', adminData)