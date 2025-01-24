const mongoose = require('mongoose');
const { connection2 } = require('../db'); 

const Schema = mongoose.Schema;

const coverData = new Schema({
    CoverURL:
    {
        type: String
    },
    CoverName: String,
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

module.exports = connection2.model('cover',coverData)