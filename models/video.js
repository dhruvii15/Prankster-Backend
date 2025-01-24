const mongoose = require('mongoose');

const { connection1 } = require('../db');
const Schema = mongoose.Schema;

const videoSchemaData = new Schema({
    Video: String,
    VideoName: String,
    VideoPremium:
    {
        type: Boolean,
        required: true
    },
    ArtistName: String,
    CategoryId: Number,
    LanguageId: Number,
    ItemId: Number,
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
        type: Number
    }
});
const VIDEO = connection1.model('Video', videoSchemaData);

module.exports =  VIDEO ;