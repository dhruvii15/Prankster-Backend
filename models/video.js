const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const videoSchemaData = new Schema({
    Video: String,
    VideoName: String,
    VideoImage : String,
    VideoPremium:
    {
        type: Boolean,
        required: true
    },
    ArtistName: String,
    CategoryId: Number,
    ItemId: Number,
    Hide: 
    {
        type: Boolean,
        required: true
    },
    viewCount: 
    {
        type: Number,
        default: 0
    }
});
const VIDEO = mongoose.model('Video', videoSchemaData);

module.exports =  VIDEO ;