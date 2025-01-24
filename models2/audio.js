const mongoose = require('mongoose');
const { connection2 } = require('../db'); 

const Schema = mongoose.Schema;

const audioSchemaData = new Schema({
    Audio: String,
    AudioName: String,
    AudioImage : String,
    AudioPremium:
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
        type: Number,
    }
});
const AUDIO = connection2.model('Audio', audioSchemaData);

module.exports =  AUDIO;