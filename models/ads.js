const mongoose = require('mongoose');
const { connection1 } = require('../db');

const Schema = mongoose.Schema;

const AdsSchemaData = new Schema({
    AdsName: String,
    AdsId: String
});

module.exports = connection1.model('ads', AdsSchemaData)