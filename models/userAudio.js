const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userAudioSchemaData = new Schema({
    Audio: String,
    AudioName: String
});
const USERAUDIO = mongoose.model('UserAudio', userAudioSchemaData);

module.exports =  USERAUDIO;