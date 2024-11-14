const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userVideoSchemaData = new Schema({
    Video: String,
    VideoName: String,
});
const USERVIDEO = mongoose.model('UserVideo', userVideoSchemaData);

module.exports =  USERVIDEO;