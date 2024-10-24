const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const coverData = new Schema({
    CoverURL:
    {
        type: String
    },
    Category: {
        type: String,
        enum: ['emoji', 'realistic']
    },
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
    ItemId : Number
});

module.exports = mongoose.model('cover',coverData)