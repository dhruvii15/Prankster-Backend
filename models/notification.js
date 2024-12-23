const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const NotificationSchemaData = new Schema({
    Title: String,
    Description: String
},
{ timestamps: true });

module.exports = mongoose.model('notification', NotificationSchemaData)