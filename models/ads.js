const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const AdsSchemaData = new Schema({
    AdsName: String,
    AdsId: String
},
{ timestamps: true });

module.exports = mongoose.model('ads', AdsSchemaData)