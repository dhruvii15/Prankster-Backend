const mongoose = require('mongoose');
const { connection2 } = require('../db'); 


const Schema = mongoose.Schema;

const userAudioSchemaData = new Schema({
    Audio: String,
    AudioName: String
});
const USERAUDIO = connection2.model('UserAudio', userAudioSchemaData);

module.exports =  USERAUDIO;