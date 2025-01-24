const mongoose = require('mongoose');

const { connection1 } = require('../db');
const Schema = mongoose.Schema;

const userAudioSchemaData = new Schema({
    Audio: String,
    AudioName: String
});
const USERAUDIO = connection1.model('UserAudio', userAudioSchemaData);

module.exports =  USERAUDIO;