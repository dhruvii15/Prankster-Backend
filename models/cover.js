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
    }
});

module.exports = mongoose.model('cover',coverData)