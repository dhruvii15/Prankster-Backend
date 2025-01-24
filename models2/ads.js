const mongoose = require('mongoose');
const { connection2 } = require('../db'); 

const Schema = mongoose.Schema;

const AdsSchemaData = new Schema({
    AdsName: String,
    IosAdsId: String,
    AndroidAdsId: String
});

module.exports = connection2.model('ads', AdsSchemaData)