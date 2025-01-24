const mongoose = require('mongoose');

const { connection1 } = require('../db');

const Schema = mongoose.Schema;

const spinnerData = new Schema({
    Link: String,
    CoverImage: String,
    File: String,
    Image: String,
    Type: String,
    Name: String,
    ShareURL: String,
    ItemId: Number,
});


module.exports = connection1.model('spinner', spinnerData)