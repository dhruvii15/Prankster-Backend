const mongoose = require('mongoose');
const { connection1 } = require('../db');

const Schema = mongoose.Schema;

const coverData = new Schema({
    CoverURL:
    {
        type: String
    },
    CoverName: String,
    Category: {
        type: String,
        enum: ['emoji', 'realistic']
    },
    TagName: [String],
    CoverPremium:
    {
        type: Boolean,
        required: true
    },
    Hide: 
    {
        type: Boolean,
        required: true
    },
    Unsafe: 
    {
        type: Boolean,
        required: true
    },
    viewCount: 
    {
        type: Number,
        default: 0
    },
    ItemId : Number
});

module.exports = connection1.model('cover',coverData)