const mongoose = require('mongoose');

const { connection1 } = require('../db');
const Schema = mongoose.Schema;

const userCoverSchemaData = new Schema({
    CoverURL: String,
    CoverName: String
});
const USERCOVER = connection1.model('UserCover', userCoverSchemaData);

module.exports =  USERCOVER;