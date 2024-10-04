const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const characterSchemaData = new Schema({
    CharacterName: String,
    CharacterImage: String
});

const audioSchemaData = new Schema({
    Audio: String,
    AudioName: String,
    AudioImage : String,
    AudioPremium:
    {
        type: Boolean,
        required: true
    },
    CharacterName : String
});

const CHARACTER = mongoose.model('AudioCharacter', characterSchemaData);
const AUDIO = mongoose.model('Audio', audioSchemaData);

module.exports = { CHARACTER, AUDIO };