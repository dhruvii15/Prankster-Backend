const mongoose = require('mongoose');
const { connection2 } = require('../db'); 


const Schema = mongoose.Schema;

const userVideoSchemaData = new Schema({
    Video: String,
    VideoName: String,
});
const USERVIDEO = connection2.model('UserVideo', userVideoSchemaData);

module.exports =  USERVIDEO;