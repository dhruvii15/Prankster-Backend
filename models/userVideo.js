const mongoose = require('mongoose');

const { connection1 } = require('../db');
const Schema = mongoose.Schema;

const userVideoSchemaData = new Schema({
    Video: String,
    VideoName: String,
});
const USERVIDEO = connection1.model('UserVideo', userVideoSchemaData);

module.exports =  USERVIDEO;