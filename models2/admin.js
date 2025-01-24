const mongoose = require('mongoose');
const { connection2 } = require('../db'); 

const Schema = mongoose.Schema;

const adminData = new Schema({
    email: {
        type: String
    },
    pass: {
        type: String
    },
    confirmpass: String,
    AdsStatus: {
        type: Boolean,
        enum: [true, false]
    },
    CoverSafe: {
        type: Boolean,
        enum: [true, false]
    },
    AudioSafe: {
        type: Boolean,
        enum: [true, false]
    },
    VideoSafe: {
        type: Boolean,
        enum: [true, false]
    },
    ImageSafe: {
        type: Boolean,
        enum: [true, false]
    }
});

module.exports = connection2.model('Admin', adminData);