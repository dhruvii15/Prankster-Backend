const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userCoverSchemaData = new Schema({
    CoverURL: String,
    CoverName: String
});
const USERCOVER = mongoose.model('UserCover', userCoverSchemaData);

module.exports =  USERCOVER;