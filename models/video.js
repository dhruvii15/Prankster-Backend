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
    CharacterId: Number,
});
const VIDEO = mongoose.model('Video', videoSchemaData);

module.exports =  VIDEO ;