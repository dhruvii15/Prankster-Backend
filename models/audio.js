const mongoose = require('mongoose');

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
    CharacterId: Number,
    ItemId: Number,
});
const AUDIO = mongoose.model('Audio', audioSchemaData);

module.exports =  AUDIO;