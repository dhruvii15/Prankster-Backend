const mongoose = require('mongoose');
const { connection2 } = require('../db'); 


const Schema = mongoose.Schema;

const userCoverSchemaData = new Schema({
    CoverURL: String,
    CoverName: String
});
const USERCOVER = connection2.model('UserCover', userCoverSchemaData);

module.exports =  USERCOVER;