const mongoose = require('mongoose');
const { connection2 } = require('../db'); 

const Schema = mongoose.Schema;

const NotificationSchemaData = new Schema({
    Title: String,
    Description: String
},
{ timestamps: true });

module.exports = connection2.model('notification', NotificationSchemaData)